from datetime import date, datetime, timezone
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Response
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Task as TaskModel
from models import User as UserModel

app = FastAPI()


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


async def get_task_or_404(
    task_id: int,
    db: AsyncSession = Depends(get_db),
) -> TaskModel:
    task = await db.get(TaskModel, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.get("/")
def read_root():
    return {"Hello": "User"}


@app.get("/users", response_model=list[UserOut])
async def read_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel))
    return result.scalars().all()


@app.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    user = UserModel(
        name=payload.name,
        email=payload.email,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@app.get("/tasks", response_model=list[TaskOut])
async def read_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TaskModel))
    return result.scalars().all()


@app.post("/tasks", response_model=TaskOut, status_code=201)
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db)):
    user = await db.get(UserModel, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

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
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@app.get("/tasks/{task_id}", response_model=TaskOut)
async def read_task(task: TaskModel = Depends(get_task_or_404)):
    return task


@app.put("/tasks/{task_id}", response_model=TaskOut)
async def replace_task(
    payload: TaskCreate,
    task: TaskModel = Depends(get_task_or_404),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(UserModel, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    task.title = payload.title
    task.description = payload.description
    task.status = payload.status
    task.priority = payload.priority
    task.due_date = payload.due_date
    task.user_id = payload.user_id
    task.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(task)
    return task


@app.patch("/tasks/{task_id}", response_model=TaskOut)
async def patch_task(
    payload: TaskUpdate,
    task: TaskModel = Depends(get_task_or_404),
    db: AsyncSession = Depends(get_db),
):
    changes = payload.model_dump(exclude_unset=True)
    if "user_id" in changes:
        user = await db.get(UserModel, changes["user_id"])
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

    for key, value in changes.items():
        setattr(task, key, value)
    task.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task: TaskModel = Depends(get_task_or_404),
    db: AsyncSession = Depends(get_db),
):
    await db.delete(task)
    await db.commit()
    return Response(status_code=204)
