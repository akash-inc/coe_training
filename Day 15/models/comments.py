from datetime import datetime

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
