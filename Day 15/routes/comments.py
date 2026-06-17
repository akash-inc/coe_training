from fastapi import APIRouter, Depends, HTTPException, Response

from auth import get_current_user
from comment_ws import (
    comment_created_message,
    comment_deleted_message,
    comment_updated_message,
)
from connection_manager import manager
from dependencies import get_comment_repository, get_task_repository
from models.comments import Comment, CommentCreate, CommentUpdate
from repositories import CommentRepository, TaskRepository

router = APIRouter()


@router.post("/tasks/{task_id}/comments", response_model=Comment)
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


@router.get("/tasks/{task_id}/comments", response_model=list[Comment])
def list_comments(
    task_id: int,
    _: str = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
    comment_repository: CommentRepository = Depends(get_comment_repository),
):
    if not task_repository.exists(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return comment_repository.list_by_task_id(task_id)


@router.patch("/tasks/{task_id}/comments/{comment_id}", response_model=Comment)
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


@router.delete("/tasks/{task_id}/comments/{comment_id}", status_code=204)
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
