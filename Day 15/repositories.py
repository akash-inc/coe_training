from abc import ABC, abstractmethod
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from elastic_apm_config import repository_span
from models.comments import COMMENT_BODY_MAX_LENGTH, Comment
from models.tasks import Task, TaskCreate, TaskUpdate
from orm_models import CommentModel, TaskModel


def _to_task(row: TaskModel) -> Task:
    return Task(
        id=row.id,
        title=row.title,
        description=row.description,
        completed=row.completed,
    )


def _to_comment(row: CommentModel) -> Comment:
    return Comment(
        id=row.id,
        task_id=row.task_id,
        body=row.body,
        author_email=row.author_email,
        created_at=row.created_at,
    )


def _commit_and_refresh(session: Session, entity: object) -> None:
    try:
        session.commit()
    except SQLAlchemyError:
        session.rollback()
        raise
    session.refresh(entity)


def _validate_comment_body(body: str) -> str:
    body = body.strip()
    if not body:
        raise ValueError("Body is required")
    if len(body) > COMMENT_BODY_MAX_LENGTH:
        raise ValueError("Body is too long")
    return body


class TaskRepository(ABC):
    @abstractmethod
    def list_all(self) -> list[Task]:
        pass

    @abstractmethod
    def get_by_id(self, task_id: int) -> Task | None:
        pass

    @abstractmethod
    def exists(self, task_id: int) -> bool:
        pass

    @abstractmethod
    def create(self, payload: TaskCreate) -> Task:
        pass

    @abstractmethod
    def update_partial(self, task_id: int, payload: TaskUpdate) -> Task:
        pass

    @abstractmethod
    def delete(self, task_id: int) -> None:
        pass


class CommentRepository(ABC):
    @abstractmethod
    def list_by_task_id(self, task_id: int) -> list[Comment]:
        pass

    @abstractmethod
    def create(self, task_id: int, body: str, author_email: str) -> Comment:
        pass

    @abstractmethod
    def update(self, comment_id: int, body: str, author_email: str) -> Comment:
        pass

    @abstractmethod
    def delete(self, comment_id: int, author_email: str) -> Comment:
        pass


class SqlAlchemyTaskRepository(TaskRepository):
    def __init__(self, session: Session):
        self.session = session

    def list_all(self) -> list[Task]:
        with repository_span("task.list_all"):
            rows = self.session.scalars(select(TaskModel).order_by(TaskModel.id)).all()
            return [_to_task(row) for row in rows]

    def get_by_id(self, task_id: int) -> Task | None:
        with repository_span("task.get_by_id"):
            row = self.session.scalar(select(TaskModel).where(TaskModel.id == task_id))
            return _to_task(row) if row else None

    def exists(self, task_id: int) -> bool:
        with repository_span("task.exists"):
            return self.get_by_id(task_id) is not None

    def _get_row_or_raise(self, task_id: int) -> TaskModel:
        row = self.session.scalar(select(TaskModel).where(TaskModel.id == task_id))
        if row is None:
            raise LookupError("Task not found")
        return row

    def create(self, payload: TaskCreate) -> Task:
        with repository_span("task.create"):
            row = TaskModel(
                title=payload.title.strip(),
                description=payload.description.strip(),
                completed=payload.completed,
            )
            self.session.add(row)
            _commit_and_refresh(self.session, row)
            return _to_task(row)

    def update_partial(self, task_id: int, payload: TaskUpdate) -> Task:
        with repository_span("task.update_partial"):
            row = self._get_row_or_raise(task_id)
            changes = payload.model_dump(exclude_unset=True)
            if "title" in changes and changes["title"] is not None:
                changes["title"] = changes["title"].strip()
            if "description" in changes and changes["description"] is not None:
                changes["description"] = changes["description"].strip()

            for field, value in changes.items():
                setattr(row, field, value)

            _commit_and_refresh(self.session, row)
            return _to_task(row)

    def delete(self, task_id: int) -> None:
        with repository_span("task.delete"):
            row = self._get_row_or_raise(task_id)
            self.session.delete(row)
            try:
                self.session.commit()
            except SQLAlchemyError:
                self.session.rollback()
                raise


class SqlAlchemyCommentRepository(CommentRepository):
    def __init__(self, session: Session):
        self.session = session

    def _get_row_or_raise(self, comment_id: int) -> CommentModel:
        row = self.session.scalar(select(CommentModel).where(CommentModel.id == comment_id))
        if row is None:
            raise LookupError("Comment not found")
        return row

    def list_by_task_id(self, task_id: int) -> list[Comment]:
        with repository_span("comment.list_by_task_id"):
            rows = self.session.scalars(
                select(CommentModel)
                .where(CommentModel.task_id == task_id)
                .order_by(CommentModel.created_at)
            ).all()
            return [_to_comment(row) for row in rows]

    def create(self, task_id: int, body: str, author_email: str) -> Comment:
        with repository_span("comment.create"):
            if not author_email:
                raise ValueError("Author email is required")

            row = CommentModel(
                task_id=task_id,
                body=_validate_comment_body(body),
                author_email=author_email,
                created_at=datetime.now(timezone.utc),
            )
            self.session.add(row)
            _commit_and_refresh(self.session, row)
            return _to_comment(row)

    def update(self, comment_id: int, body: str, author_email: str) -> Comment:
        with repository_span("comment.update"):
            row = self._get_row_or_raise(comment_id)
            if row.author_email != author_email:
                raise PermissionError("Not authorized to update this comment")

            row.body = _validate_comment_body(body)
            _commit_and_refresh(self.session, row)
            return _to_comment(row)

    def delete(self, comment_id: int, author_email: str) -> Comment:
        with repository_span("comment.delete"):
            row = self._get_row_or_raise(comment_id)
            if row.author_email != author_email:
                raise PermissionError("Not authorized to delete this comment")

            comment = _to_comment(row)
            self.session.delete(row)
            try:
                self.session.commit()
            except SQLAlchemyError:
                self.session.rollback()
                raise
            return comment
