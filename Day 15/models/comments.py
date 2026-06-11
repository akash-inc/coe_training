from datetime import datetime, timezone

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    body: str


class CommentUpdate(BaseModel):
    body: str = Field(min_length=1, max_length=1000)


class Comment(BaseModel):
    id: int
    task_id: int
    body: str
    author_email: str
    created_at: datetime


_comments: list[Comment] = []
_next_id: int = 1


def _validate_body(body: str) -> str:
    body = body.strip()
    if not body:
        raise ValueError("Body is required")
    if len(body) > 1000:
        raise ValueError("Body is too long")
    return body


def create_comment(task_id: int, body: str, author_email: str) -> Comment:
    if not author_email:
        raise ValueError("Author email is required")

    global _next_id
    comment = Comment(
        id=_next_id,
        task_id=task_id,
        body=_validate_body(body),
        author_email=author_email,
        created_at=datetime.now(timezone.utc),
    )
    _comments.append(comment)
    _next_id += 1
    return comment


def get_comment(comment_id: int) -> Comment | None:
    return next((comment for comment in _comments if comment.id == comment_id), None)


def get_comments(task_id: int) -> list[Comment]:
    return [comment for comment in _comments if comment.task_id == task_id]


def update_comment(comment_id: int, body: str, author_email: str) -> Comment:
    comment = get_comment(comment_id)
    if comment is None:
        raise LookupError("Comment not found")
    if comment.author_email != author_email:
        raise PermissionError("Not authorized to update this comment")

    updated = comment.model_copy(update={"body": _validate_body(body)})
    _comments[_comments.index(comment)] = updated
    return updated


def delete_comment(comment_id: int, author_email: str) -> Comment:
    comment = get_comment(comment_id)
    if comment is None:
        raise LookupError("Comment not found")
    if comment.author_email != author_email:
        raise PermissionError("Not authorized to delete this comment")

    _comments.remove(comment)
    return comment


def delete_comments_for_task(task_id: int) -> None:
    global _comments
    _comments = [comment for comment in _comments if comment.task_id != task_id]


def reset_comments() -> None:
    global _next_id
    _comments.clear()
    _next_id = 1
