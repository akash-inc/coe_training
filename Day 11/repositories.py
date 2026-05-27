from abc import ABC, abstractmethod
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from models import User, Task

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
    async def create(self, user: User) -> User:
        """Create a new user"""
        pass

class TaskRepository(ABC):
    @abstractmethod
    async def list_all(self) -> list[Task]:
        """List all tasks"""
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

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self._commit_and_refresh(user)
        return user


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