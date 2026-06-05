from datetime import date, datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession
from models import Task as TaskModel
from models import User as UserModel

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import get_db
from repositories import (
    SqlAlchemyTaskRepository,
    SqlAlchemyUserRepository,
    TaskRepository,
    UserRepository,
)

app = FastAPI(title="Task Management API")
FRONTEND_DIST = Path(__file__).resolve().parent / "frontend" / "dist"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128, pattern=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


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


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(open|in_progress|done)$")
    priority: Optional[int] = Field(default=None, ge=1, le=5)
    due_date: Optional[date] = None


def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return SqlAlchemyUserRepository(db)


def get_task_repository(db: AsyncSession = Depends(get_db)) -> TaskRepository:
    return SqlAlchemyTaskRepository(db)


async def get_owned_task(
    task_id: int,
    current_user: UserModel = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
) -> TaskModel:
    task = await task_repository.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    return task


@app.get("/health")
def healthcheck():
    return {"Hello": "User"}


@app.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repository: UserRepository = Depends(get_user_repository),
):
    user = await user_repository.get_by_email(form_data.username)
    if user is None or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=UserOut)
async def read_current_user(current_user: UserModel = Depends(get_current_user)):
    return current_user


@app.get("/users", response_model=list[UserOut])
async def read_users(
    _: UserModel = Depends(get_current_user),
    user_repository: UserRepository = Depends(get_user_repository),
):
    return await user_repository.list_all()


@app.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate, user_repository: UserRepository = Depends(get_user_repository)):
    existing_user = await user_repository.get_by_email(payload.email)
    if existing_user is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = UserModel(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        created_at=datetime.now(timezone.utc),
    )
    return await user_repository.create(user)


@app.get("/tasks", response_model=list[TaskOut])
async def read_tasks(
    current_user: UserModel = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    return await task_repository.list_by_user_id(current_user.id)


@app.post("/tasks", response_model=TaskOut, status_code=201)
async def create_task(
    payload: TaskCreate,
    current_user: UserModel = Depends(get_current_user),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    now = datetime.now(timezone.utc)
    task = TaskModel(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.due_date,
        user_id=current_user.id,
        created_at=now,
        updated_at=now,
    )
    return await task_repository.create(task)


@app.get("/tasks/{task_id}", response_model=TaskOut)
async def read_task(task: TaskModel = Depends(get_owned_task)):
    return task


@app.put("/tasks/{task_id}", response_model=TaskOut)
async def replace_task(
    payload: TaskCreate,
    task: TaskModel = Depends(get_owned_task),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    replacement_data = payload.model_dump()
    replacement_data["user_id"] = task.user_id
    replacement_data["updated_at"] = datetime.now(timezone.utc)
    return await task_repository.replace(task.id, replacement_data)


@app.patch("/tasks/{task_id}", response_model=TaskOut)
async def patch_task(
    payload: TaskUpdate,
    task: TaskModel = Depends(get_owned_task),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    changes = payload.model_dump(exclude_unset=True)
    changes["updated_at"] = datetime.now(timezone.utc)
    return await task_repository.update_partial(task.id, changes)


@app.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task: TaskModel = Depends(get_owned_task),
    task_repository: TaskRepository = Depends(get_task_repository),
):
    await task_repository.delete(task.id)
    return Response(status_code=204)


if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
