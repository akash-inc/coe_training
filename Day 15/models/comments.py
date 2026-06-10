from datetime import datetime

from pydantic import BaseModel


class CommentCreate(BaseModel):
    body: str


class Comment(BaseModel):
    id: int
    task_id: int
    body: str
    author_email: str
    created_at: datetime


_comments: list[Comment] = []
_next_id: int = 1


def create_comment(task_id: int, body: str, author_email: str) -> Comment:
    body = body.strip()
    if not body:
        raise ValueError("Body is required")
    if not author_email:
        raise ValueError("Author email is required")
    if len(body) > 1000:
        raise ValueError("Body is too long")
    global _next_id
    comment = Comment(
        id=_next_id,
        task_id=task_id,
        body=body,
        author_email=author_email,
        created_at=datetime.now(),
    )
    _comments.append(comment)
    _next_id += 1
    return comment

def get_all_comments() -> list[Comment]:
    return _comments

def get_comments(task_id: int) -> list[Comment]:
    return [comment for comment in _comments if comment.task_id == task_id]