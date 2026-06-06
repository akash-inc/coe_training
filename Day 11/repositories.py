from abc import ABC, abstractmethod
from typing import Any, Optional
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from models import RefreshToken, User, Task

class RefreshTokenRepository(ABC):
    @abstractmethod
    async def save_refresh_token(self, user_id: int, token: str, expires_at: datetime) -> None:
        """Save a refresh token for a user"""
        pass

    @abstractmethod
    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        """Get a refresh token by token"""
        pass

    @abstractmethod
    async def delete_refresh_token(self, token: str) -> None:
        """Delete a refresh token by token"""
        pass

    @abstractmethod
    async def delete_all_refresh_tokens_for_user(self, user_id: int) -> None:
        """Delete all refresh tokens for a user"""
        pass


class UserRepository(ABC):
    @abstractmethod
    async def list_all(self) -> list[User]:
        """List all users"""
        pass

    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by id"""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get a user by email"""
        pass

    @abstractmethod
    async def create(self, user: User) -> User:
        """Create a new user"""
        pass

    @abstractmethod
    async def delete(self, user_id: int) -> None:
        """Delete a user by id"""
        pass

class TaskRepository(ABC):
    @abstractmethod
    async def list_all(self) -> list[Task]:
        """List all tasks"""
        pass

    @abstractmethod
    async def list_by_user_id(self, user_id: int) -> list[Task]:
        """List tasks owned by a user"""
        pass

    @abstractmethod
    async def get_by_id(self, task_id: int) -> Optional[Task]:
        """Get a task by id"""
        pass

    @abstractmethod
    async def create(self, task: Task) -> Task:
        """Create a new task"""
        pass

    @abstractmethod
    async def replace(self, task_id: int, task_data: dict[str, Any]) -> Task:
        """Replace a task"""
        pass

    @abstractmethod
    async def update_partial(self, task_id: int, task_data: dict[str, Any]) -> Task:
        """Update a task partially"""
        pass

    @abstractmethod
    async def delete(self, task_id: int) -> None:
        """Delete a task"""
        pass


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _commit_and_refresh(self, entity: User) -> None:
        try:
            await self.session.commit()
        except SQLAlchemyError:
            await self.session.rollback()
            raise
        await self.session.refresh(entity)

    async def list_all(self) -> list[User]:
        result = await self.session.execute(select(User))
        users = result.scalars().all()
        return list(users)

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        return user

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self._commit_and_refresh(user)
        return user

    async def delete(self, user_id: int) -> None:
        user = await self.get_by_id(user_id)
        if user is None:
            raise ValueError(f"User with id {user_id} not found")
        await self.session.delete(user)
        try:
            await self.session.commit()
        except SQLAlchemyError:
            await self.session.rollback()
            raise


class SqlAlchemyTaskRepository(TaskRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _commit_and_refresh(self, entity: Task) -> None:
        try:
            await self.session.commit()
        except SQLAlchemyError:
            await self.session.rollback()
            raise
        await self.session.refresh(entity)

    async def list_all(self) -> list[Task]:
        result = await self.session.execute(select(Task))
        tasks = result.scalars().all()
        return list(tasks)

    async def list_by_user_id(self, user_id: int) -> list[Task]:
        result = await self.session.execute(select(Task).where(Task.user_id == user_id))
        tasks = result.scalars().all()
        return list(tasks)

    async def get_by_id(self, task_id: int) -> Optional[Task]:
        result = await self.session.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        return task

    async def _get_by_id_or_raise(self, task_id: int) -> Task:
        task = await self.get_by_id(task_id)
        if task is None:
            raise ValueError(f"Task with id {task_id} not found")
        return task

    async def create(self, task: Task) -> Task:
        self.session.add(task)
        await self._commit_and_refresh(task)
        return task

    async def replace(self, task_id: int, task_data: dict[str, Any]) -> Task:
        existing_task = await self._get_by_id_or_raise(task_id)

        existing_task.title = task_data["title"]
        existing_task.description = task_data["description"]
        existing_task.status = task_data["status"]
        existing_task.priority = task_data["priority"]
        existing_task.due_date = task_data["due_date"]
        existing_task.updated_at = task_data["updated_at"]
        existing_task.user_id = task_data["user_id"]

        await self._commit_and_refresh(existing_task)
        return existing_task

    async def update_partial(self, task_id: int, task_data: dict[str, Any]) -> Task:
        existing_task = await self._get_by_id_or_raise(task_id)

        for field, value in task_data.items():
            setattr(existing_task, field, value)

        await self._commit_and_refresh(existing_task)
        return existing_task

    async def delete(self, task_id: int) -> None:
        task = await self._get_by_id_or_raise(task_id)
        await self.session.delete(task)
        try:
            await self.session.commit()
        except SQLAlchemyError:
            await self.session.rollback()
            raise

class SqlAlchemyRefreshTokenRepository(RefreshTokenRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save_refresh_token(self, user_id: int, token: str, expires_at: datetime) -> None:
        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc),
        )
        self.session.add(refresh_token)
        try:
            await self.session.commit()
        except SQLAlchemyError:
            await self.session.rollback()
            raise

    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        result = await self.session.execute(select(RefreshToken).where(RefreshToken.token == token))
        refresh_token = result.scalar_one_or_none()
        return refresh_token

    async def delete_refresh_token(self, token: str) -> None:
        refresh_token = await self.get_refresh_token(token)
        if refresh_token is None:
            return
        await self.session.delete(refresh_token)
        try:
            await self.session.commit()
        except SQLAlchemyError:
            await self.session.rollback()
            raise

    async def delete_all_refresh_tokens_for_user(self, user_id: int) -> None:
        result = await self.session.execute(select(RefreshToken).where(RefreshToken.user_id == user_id))
        refresh_tokens = result.scalars().all()
        if not refresh_tokens:
            return
        for refresh_token in refresh_tokens:
            await self.session.delete(refresh_token)
        try:
            await self.session.commit()
        except SQLAlchemyError:
            await self.session.rollback()
            raise