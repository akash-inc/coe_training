from datetime import date, datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field

app = FastAPI()


class Task(BaseModel):
    id: int
    title: str = Field(default="Untitled", min_length=1, max_length=255)
    description: str = ""
    status: str = Field(default="open", pattern="^(open|in_progress|done)$")
    priority: int = Field(default=1, ge=1, le=5)
    due_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime


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


tasks_db: dict[int, Task] = {
    1: Task(
        id=1,
        title="Learn FastAPI",
        description="Build CRUD endpoints",
        status="open",
        priority=1,
        due_date=date.today(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
}

def get_task_or_404(task_id: int) -> Task:
    task = tasks_db.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.get("/")
def read_root():
    return {"Hello": "User"}


@app.get("/tasks", response_model=list[Task])
def read_tasks():
    return list(tasks_db.values())


@app.post("/tasks", response_model=Task, status_code=201)
def create_task(payload: TaskCreate):
    task_id = max(tasks_db.keys()) + 1
    now = datetime.now(timezone.utc)
    task = Task(
        id=task_id,
        created_at=now,
        updated_at=now,
        **payload.model_dump(),
    )
    tasks_db[task_id] = task
    return task

@app.get("/tasks/{task_id}", response_model=Task)
def read_task(task: Task = Depends(get_task_or_404)):
    return task

@app.put("/tasks/{task_id}", response_model=Task)
def replace_task(payload: TaskCreate, existing: Task = Depends(get_task_or_404)):
    updated = Task(
        id=existing.id,
        created_at=existing.created_at,
        updated_at=datetime.now(timezone.utc),
        **payload.model_dump(),
    )
    tasks_db[existing.id] = updated
    return updated


@app.patch("/tasks/{task_id}", response_model=Task)
def patch_task(payload: TaskUpdate, existing: Task = Depends(get_task_or_404)):
    # Only apply fields the client actually sent
    changes = payload.model_dump(exclude_unset=True)
    updated = existing.model_copy(
        update={**changes, "updated_at": datetime.now(timezone.utc)}
    )
    tasks_db[existing.id] = updated
    return updated


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(existing: Task = Depends(get_task_or_404)):
    del tasks_db[existing.id]
