from fastapi import WebSocket

from connection_manager import ConnectionManager
from models.comments import Comment
from repositories import CommentRepository

MSG_COMMENT_CREATE = "comment.create"
MSG_COMMENT_CREATED = "comment.created"
MSG_COMMENT_UPDATED = "comment.updated"
MSG_COMMENT_DELETED = "comment.deleted"
MSG_COMMENTS_SNAPSHOT = "comments.snapshot"
MSG_ERROR = "error"


def comment_created_message(comment: Comment) -> dict:
    return {
        "type": MSG_COMMENT_CREATED,
        "comment": comment.model_dump(mode="json"),
    }


def comment_updated_message(comment: Comment) -> dict:
    return {
        "type": MSG_COMMENT_UPDATED,
        "comment": comment.model_dump(mode="json"),
    }


def comment_deleted_message(comment_id: int, task_id: int) -> dict:
    return {
        "type": MSG_COMMENT_DELETED,
        "comment_id": comment_id,
        "task_id": task_id,
    }


def comments_snapshot_message(comments: list[Comment]) -> dict:
    return {
        "type": MSG_COMMENTS_SNAPSHOT,
        "comments": [comment.model_dump(mode="json") for comment in comments],
    }


def error_message(message: str) -> dict:
    return {"type": MSG_ERROR, "message": message}


async def send_error(websocket: WebSocket, message: str) -> None:
    await websocket.send_json(error_message(message))


async def handle_incoming_message(
    websocket: WebSocket,
    manager: ConnectionManager,
    task_id: int,
    user_email: str,
    data: object,
    comment_repository: CommentRepository,
) -> None:
    if not isinstance(data, dict):
        await send_error(websocket, "Message must be a JSON object")
        return

    msg_type = data.get("type")
    if msg_type != MSG_COMMENT_CREATE:
        await send_error(websocket, f"Unknown message type: {msg_type}")
        return

    body = data.get("body")
    if not isinstance(body, str):
        await send_error(websocket, "body must be a string")
        return

    try:
        comment = comment_repository.create(task_id, body, user_email)
    except ValueError as exc:
        await send_error(websocket, str(exc))
        return

    await manager.broadcast(task_id, comment_created_message(comment))
