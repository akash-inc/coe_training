from abc import ABC, abstractmethod
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
    async def replace(self, task: Task) -> Task:
        """Replace a task"""
        pass

    @abstractmethod
    async def update_partial(self, task: Task) -> Task:
        """Update a task partially"""
        pass

    @abstractmethod
    async def delete(self, task_id: int) -> None:
        """Delete a task"""
        pass


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> list[User]:
        result = await self.session.execute(select(User))
        users = result.scalars().all()
        return list(users)

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.session.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        return user

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user


class SqlAlchemyTaskRepository(TaskRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> list[Task]:
        result = await self.session.execute(select(Task))
        tasks = result.scalars().all()
        return list(tasks)

    async def get_by_id(self, task_id: int) -> Optional[Task]:
        result = await self.session.execute(select(Task).filter(Task.id == task_id))
        task = result.scalar_one_or_none()
        return task

    async def create(self, task: Task) -> Task:
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def replace(self, task: Task) -> Task:
        existing_task = await self.get_by_id(task.id)
        if existing_task is None:
            raise ValueError(f"Task with id {task.id} not found")

        existing_task.title = task.title
        existing_task.description = task.description
        existing_task.status = task.status
        existing_task.priority = task.priority
        existing_task.due_date = task.due_date
        existing_task.updated_at = task.updated_at
        existing_task.user_id = task.user_id

        await self.session.commit()
        await self.session.refresh(existing_task)
        return existing_task

    async def update_partial(self, task: Task) -> Task:
        existing_task = await self.get_by_id(task.id)
        if existing_task is None:
            raise ValueError(f"Task with id {task.id} not found")

        updatable_fields = (
            "title",
            "description",
            "status",
            "priority",
            "updated_at",
            "user_id",
        )
        for field in updatable_fields:
            value = getattr(task, field, None)
            if value is not None:
                setattr(existing_task, field, value)

        # Allow explicit due_date removal.
        existing_task.due_date = task.due_date

        await self.session.commit()
        await self.session.refresh(existing_task)
        return existing_task

    async def delete(self, task_id: int) -> None:
        task = await self.get_by_id(task_id)
        if not task:
            raise ValueError(f"Task with id {task_id} not found")
        await self.session.delete(task)
        await self.session.commit()