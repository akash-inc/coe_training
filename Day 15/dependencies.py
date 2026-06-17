from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from elastic_apm_config import repository_span
from repositories import (
    CommentRepository,
    SqlAlchemyCommentRepository,
    SqlAlchemyTaskRepository,
    TaskRepository,
)


def get_task_repository(db: Session = Depends(get_db)) -> TaskRepository:
    return SqlAlchemyTaskRepository(db, span_factory=repository_span)


def get_comment_repository(db: Session = Depends(get_db)) -> CommentRepository:
    return SqlAlchemyCommentRepository(db, span_factory=repository_span)
