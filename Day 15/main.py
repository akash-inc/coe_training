import logging
from contextlib import asynccontextmanager

from elasticapm.contrib.starlette import ElasticAPM
from fastapi import Depends, FastAPI, HTTPException, Query, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from alerting import report_critical_error
from auth import (
    create_access_token,
    get_current_user,
    get_user_from_token,
    issue_refresh_token,
    revoke_refresh_token,
    validate_refresh_token,
)
from comment_ws import (
    comment_created_message,
    comment_deleted_message,
    comment_updated_message,
    comments_snapshot_message,
    handle_incoming_message,
)
from config import DEMO_USER_EMAIL, DEMO_USER_PASSWORD, get_cors_origins
from connection_manager import ConnectionManager
from database import SessionLocal, get_db
from health import HealthResponse, LiveResponse, build_health_response
from models.comments import Comment, CommentCreate, CommentUpdate
from models.tasks import Task, TaskCreate, TaskUpdate
from logging_config import RequestLoggingMiddleware, setup_logging
from elastic_apm_config import make_apm_client
from sentry_config import init_sentry
from tracing import (
    REQUEST_ID_HEADER,
    TRACE_ID_HEADER,
    bind_trace_context,
    resolve_request_id,
    resolve_trace_id,
)
from repositories import (
    CommentRepository,
    SqlAlchemyCommentRepository,
    SqlAlchemyTaskRepository,
    TaskRepository,
)

init_sentry()
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("application started", extra={"event": "app.startup"})
    with SessionLocal() as session:
        startup_health = build_health_response(session)
        if startup_health.status != "healthy":
            database = startup_health.checks["database"]
            report_critical_error(
                "database unavailable at startup",
                event="app.startup.database_unavailable",
                database_status=database.status,
                database_detail=database.detail,
            )
    yield
    logger.info("application stopped", extra={"event": "app.shutdown"})


app = FastAPI(lifespan=lifespan)
manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

apm_client = make_apm_client()
if apm_client:
    app.add_middleware(ElasticAPM, client=apm_client)


def get_task_repository(db: Session = Depends(get_db)) -> TaskRepository:
    return SqlAlchemyTaskRepository(db)


def get_comment_repository(db: Session = Depends(get_db)) -> CommentRepository:
    return SqlAlchemyCommentRepository(db)


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.get("/live", response_model=LiveResponse)
def liveness():
    return LiveResponse(status="ok")


@app.get("/ready", response_model=HealthResponse)
def readiness(db: Session = Depends(get_db)):
    health = build_health_response(db)
    if health.status != "healthy":
        raise HTTPException(status_code=503, detail=health.model_dump())
    return health


@app.get("/health", response_model=HealthResponse)
def health(db: Session = Depends(get_db)):
    health_response = build_health_response(db)
    if health_response.status != "healthy":
        raise HTTPException(status_code=503, detail=health_response.model_dump())
    return health_response


@app.get("/me")
def current_user(current_user: str = Depends(get_current_user)):
    return {"email": current_user}


@app.get("/tasks", response_model=list[Task])
def read_tasks(
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    return task_repository.list_all()


@app.post("/tasks", response_model=Task, status_code=201)
def create_task_route(
    payload: TaskCreate,
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    return task_repository.create(payload)


@app.get("/tasks/{task_id}", response_model=Task)
def read_task(
    task_id: int,
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    task = task_repository.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/tasks/{task_id}", response_model=Task)
def patch_task(
    task_id: int,
    payload: TaskUpdate,
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    try:
        return task_repository.update_partial(task_id, payload)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.delete("/tasks/{task_id}", status_code=204)
def remove_task(
    task_id: int,
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    try:
        task_repository.delete(task_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return Response(status_code=204)


@app.post("/token")
def login(data: LoginRequest):
    if data.email != DEMO_USER_EMAIL or data.password != DEMO_USER_PASSWORD:
        logger.warning(
            "login failed",
            extra={"event": "auth.login_failed", "user_email": data.email},
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": data.email})
    refresh_token = issue_refresh_token(data.email)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@app.post("/token/refresh")
def refresh_access_token(payload: RefreshTokenRequest):
    email = validate_refresh_token(payload.refresh_token)
    access_token = create_access_token({"sub": email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/logout", status_code=204)
def logout(payload: RefreshTokenRequest):
    revoke_refresh_token(payload.refresh_token)
    return Response(status_code=204)


@app.websocket("/ws/echo")
async def ws_echo(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        pass


@app.post("/tasks/{task_id}/comments", response_model=Comment)
async def post_comment(
    task_id: int,
    payload: CommentCreate,
    current_user: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
    comment_repository: CommentRepository = Depends(get_comment_repository),
):
    if not task_repository.exists(task_id):
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        comment = comment_repository.create(task_id, payload.body, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    await manager.broadcast(task_id, comment_created_message(comment))
    return comment


@app.get("/tasks/{task_id}/comments", response_model=list[Comment])
def list_comments(
    task_id: int,
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
    comment_repository: CommentRepository = Depends(get_comment_repository),
):
    if not task_repository.exists(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return comment_repository.list_by_task_id(task_id)


@app.patch("/tasks/{task_id}/comments/{comment_id}", response_model=Comment)
async def patch_comment(
    task_id: int,
    comment_id: int,
    payload: CommentUpdate,
    current_user: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
    comment_repository: CommentRepository = Depends(get_comment_repository),
):
    if not task_repository.exists(task_id):
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        comment = comment_repository.update(comment_id, payload.body, current_user)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if comment.task_id != task_id:
        raise HTTPException(status_code=404, detail="Comment not found")

    await manager.broadcast(task_id, comment_updated_message(comment))
    return comment


@app.delete("/tasks/{task_id}/comments/{comment_id}", status_code=204)
async def remove_comment(
    task_id: int,
    comment_id: int,
    current_user: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
    comment_repository: CommentRepository = Depends(get_comment_repository),
):
    if not task_repository.exists(task_id):
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        comment = comment_repository.delete(comment_id, current_user)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    if comment.task_id != task_id:
        raise HTTPException(status_code=404, detail="Comment not found")

    await manager.broadcast(task_id, comment_deleted_message(comment.id, task_id))
    return Response(status_code=204)


@app.websocket("/ws/tasks/{task_id}")
async def task_comments_ws(
    websocket: WebSocket,
    task_id: int,
    token: str = Query(...),
    request_id: str | None = Query(None),
    trace_id: str | None = Query(None),
    task_repository: TaskRepository = Depends(get_task_repository),
    comment_repository: CommentRepository = Depends(get_comment_repository),
):
    resolved_request_id = resolve_request_id(
        request_id or websocket.headers.get(REQUEST_ID_HEADER)
    )
    resolved_trace_id = resolve_trace_id(
        trace_id or websocket.headers.get(TRACE_ID_HEADER),
        fallback=resolved_request_id,
    )

    with bind_trace_context(resolved_request_id, resolved_trace_id):
        await websocket.accept()

        if not task_repository.exists(task_id):
            await websocket.close(code=1008, reason="Task not found")
            return

        try:
            user_email = get_user_from_token(token)
        except HTTPException:
            await websocket.close(code=1008, reason="Invalid token")
            return

        manager.register(websocket, task_id)
        logger.info(
            "websocket connected",
            extra={
                "event": "ws.connect",
                "task_id": task_id,
                "user_email": user_email,
            },
        )
        comments = comment_repository.list_by_task_id(task_id)
        await websocket.send_json(comments_snapshot_message(comments))

        try:
            while True:
                data = await websocket.receive_json()
                await handle_incoming_message(
                    websocket,
                    manager,
                    task_id,
                    user_email,
                    data,
                    comment_repository,
                )
        except WebSocketDisconnect:
            logger.info(
                "websocket disconnected",
                extra={
                    "event": "ws.disconnect",
                    "task_id": task_id,
                    "user_email": user_email,
                },
            )
        finally:
            manager.disconnect(websocket, task_id)
