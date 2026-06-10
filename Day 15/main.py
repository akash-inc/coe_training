from fastapi import Depends, FastAPI, HTTPException, Query, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from connection_manager import ConnectionManager
from comment_ws import (
    comment_created_message,
    comments_snapshot_message,
    handle_incoming_message,
    task_exists,
)
from models.comments import Comment, CommentCreate, create_comment, get_comments

from auth import (
    create_access_token,
    get_current_user,
    get_user_from_token,
    issue_refresh_token,
    revoke_refresh_token,
    validate_refresh_token,
)

app = FastAPI()
manager = ConnectionManager()

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.get("/me")
async def current_user(current_user: str = Depends(get_current_user)):
    return {"email": current_user}


@app.get("/tasks")
async def get_tasks(current_user: str = Depends(get_current_user)):
    return [
        {
            "id": 1,
            "title": "Task 1",
            "description": "Task 1 description",
            "completed": False,
        },
    ]


@app.post("/token")
async def login(data: LoginRequest):
    if data.email != "test@example.com" or data.password != "password":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": data.email})
    refresh_token = issue_refresh_token(data.email)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@app.post("/token/refresh")
async def refresh_access_token(payload: RefreshTokenRequest):
    email = validate_refresh_token(payload.refresh_token)
    access_token = create_access_token({"sub": email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/logout", status_code=204)
async def logout(payload: RefreshTokenRequest):
    revoke_refresh_token(payload.refresh_token)
    return Response(status_code=204)

@app.websocket("/ws/echo")
async def ws_echo(websocket: WebSocket):
        await websocket.accept()
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")    

@app.post("/tasks/{task_id}/comments", response_model=Comment)
async def post_comment(
    task_id: int,
    payload: CommentCreate,
    current_user: str = Depends(get_current_user),
):
    if not task_exists(task_id):
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        comment = create_comment(task_id, payload.body, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    await manager.broadcast(task_id, comment_created_message(comment))
    return comment


@app.get("/tasks/{task_id}/comments", response_model=list[Comment])
async def list_comments(task_id: int):
    return get_comments(task_id)

@app.websocket("/ws/tasks/{task_id}")
async def task_comments_ws(websocket: WebSocket, task_id: int, token: str = Query(...)):
    if not task_exists(task_id):
        await websocket.close(code=1008, reason="Task not found")
        return

    try:
        user_email = get_user_from_token(token)
    except HTTPException:
        await websocket.close(code=1008, reason="Invalid token")
        return

    await manager.connect(websocket, task_id, user_email)
    await websocket.send_json(comments_snapshot_message(task_id))

    try:
        while True:
            data = await websocket.receive_json()
            await handle_incoming_message(websocket, manager, task_id, user_email, data)
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket, task_id)