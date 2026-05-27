from contextlib import asynccontextmanager
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Response
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession
from models import Task as TaskModel
from models import User as UserModel

from database import get_db, init_db
from repositories import (
    SqlAlchemyTaskRepository,
    SqlAlchemyUserRepository,
    TaskRepository,
    UserRepository,
)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: int
    due_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    user_id: int
    model_config = ConfigDict(from_attributes=True)


class TaskCreate(BaseModel):
    title: str = Field(default="Untitled", min_length=1, max_length=255)
    description: str = ""
    status: str = Field(default="open", pattern="^(open|in_progress|done)$")
    priority: int = Field(default=1, ge=1, le=5)
    due_date: Optional[date] = None
    user_id: int = Field(ge=1)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(open|in_progress|done)$")
    priority: Optional[int] = Field(default=None, ge=1, le=5)
    due_date: Optional[date] = None
    user_id: Optional[int] = Field(default=None, ge=1)

def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return SqlAlchemyUserRepository(db)

def get_task_repository(db: AsyncSession = Depends(get_db)) -> TaskRepository:
    return SqlAlchemyTaskRepository(db)

async def ensure_user_exists(
    user_id: int,
    user_repository: UserRepository,
) -> None:
    user = await user_repository.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")


async def ensure_task_exists(
    task_id: int,
    task_repository: TaskRepository,
) -> None:
    task = await task_repository.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")


@app.get("/")
def read_root():
    return {"Hello": "User"}


@app.get("/users", response_model=list[UserOut])
async def read_users(user_repository: UserRepository = Depends(get_user_repository)):
    return await user_repository.list_all()


@app.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate, user_repository: UserRepository = Depends(get_user_repository)):
    user = UserModel(
        name=payload.name,
        email=payload.email,
        created_at=datetime.now(timezone.utc),
    )
    return await user_repository.create(user)


@app.get("/tasks", response_model=list[TaskOut])
async def read_tasks(task_repository: TaskRepository = Depends(get_task_repository)):
    return await task_repository.list_all()


@app.post("/tasks", response_model=TaskOut, status_code=201)
async def create_task(
    payload: TaskCreate,
    task_repository: TaskRepository = Depends(get_task_repository),
    user_repository: UserRepository = Depends(get_user_repository),
):
    await ensure_user_exists(payload.user_id, user_repository)
    now = datetime.now(timezone.utc)
    task = TaskModel(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.due_date,
        user_id=payload.user_id,
        created_at=now,
        updated_at=now,
    )
    return await task_repository.create(task)


@app.get("/tasks/{task_id}", response_model=TaskOut)
async def read_task(task_id: int, task_repository: TaskRepository = Depends(get_task_repository)):
    task = await task_repository.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.put("/tasks/{task_id}", response_model=TaskOut)
async def replace_task(
    task_id: int,
    payload: TaskCreate,
    task_repository: TaskRepository = Depends(get_task_repository),
    user_repository: UserRepository = Depends(get_user_repository),
):
    await ensure_user_exists(payload.user_id, user_repository)
    await ensure_task_exists(task_id, task_repository)
    replacement_data = payload.model_dump()
    replacement_data["updated_at"] = datetime.now(timezone.utc)
    return await task_repository.replace(task_id, replacement_data)


@app.patch("/tasks/{task_id}", response_model=TaskOut)
async def patch_task(
    task_id: int,
    payload: TaskUpdate,
    task_repository: TaskRepository = Depends(get_task_repository),
    user_repository: UserRepository = Depends(get_user_repository),
):
    changes = payload.model_dump(exclude_unset=True)
    await ensure_task_exists(task_id, task_repository)
    if "user_id" in changes:
        await ensure_user_exists(changes["user_id"], user_repository)
    changes["updated_at"] = datetime.now(timezone.utc)
    return await task_repository.update_partial(task_id, changes)


@app.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    task_repository: TaskRepository = Depends(get_task_repository),
):
    await ensure_task_exists(task_id, task_repository)
    await task_repository.delete(task_id)
    return Response(status_code=204)
