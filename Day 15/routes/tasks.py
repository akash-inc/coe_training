import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Response, WebSocket, WebSocketDisconnect

from auth import get_current_user, get_user_from_token
from comment_ws import comments_snapshot_message, handle_incoming_message
from connection_manager import manager
from dependencies import get_comment_repository, get_task_repository
from models.tasks import Task, TaskCreate, TaskUpdate
from repositories import CommentRepository, TaskRepository
from tracing import (
    REQUEST_ID_HEADER,
    TRACE_ID_HEADER,
    bind_trace_context,
    resolve_request_id,
    resolve_trace_id,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/tasks", response_model=list[Task])
def read_tasks(
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    return task_repository.list_all()


@router.post("/tasks", response_model=Task, status_code=201)
def create_task_route(
    payload: TaskCreate,
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    return task_repository.create(payload)


@router.get("/tasks/{task_id}", response_model=Task)
def read_task(
    task_id: int,
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    task = task_repository.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/tasks/{task_id}", response_model=Task)
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


@router.delete("/tasks/{task_id}", status_code=204)
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


@router.websocket("/ws/tasks/{task_id}")
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
