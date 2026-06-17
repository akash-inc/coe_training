from datetime import datetime

from pydantic import BaseModel, Field

COMMENT_BODY_MAX_LENGTH = 1000


class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=COMMENT_BODY_MAX_LENGTH)


class CommentUpdate(BaseModel):
    body: str = Field(min_length=1, max_length=COMMENT_BODY_MAX_LENGTH)


class Comment(BaseModel):
    id: int
    task_id: int
    body: str
    author_email: str
    created_at: datetime
