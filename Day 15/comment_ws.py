from fastapi import WebSocket

from connection_manager import ConnectionManager
from models.comments import Comment, create_comment, get_comments

VALID_TASK_IDS = {1}


def task_exists(task_id: int) -> bool:
    return task_id in VALID_TASK_IDS


def comment_created_message(comment: Comment) -> dict:
    return {
        "type": "comment.created",
        "comment": comment.model_dump(mode="json"),
    }


def comments_snapshot_message(task_id: int) -> dict:
    return {
        "type": "comments.snapshot",
        "comments": [comment.model_dump(mode="json") for comment in get_comments(task_id)],
    }


def error_message(message: str) -> dict:
    return {"type": "error", "message": message}


async def send_error(websocket: WebSocket, message: str) -> None:
    await websocket.send_json(error_message(message))


async def handle_incoming_message(
    websocket: WebSocket,
    manager: ConnectionManager,
    task_id: int,
    user_email: str,
    data: object,
) -> None:
    if not isinstance(data, dict):
        await send_error(websocket, "Message must be a JSON object")
        return

    msg_type = data.get("type")
    if msg_type != "comment.create":
        await send_error(websocket, f"Unknown message type: {msg_type}")
        return

    body = data.get("body")
    if not isinstance(body, str):
        await send_error(websocket, "body must be a string")
        return

    try:
        comment = create_comment(task_id, body, user_email)
    except ValueError as exc:
        await send_error(websocket, str(exc))
        return

    await manager.broadcast(task_id, comment_created_message(comment))
