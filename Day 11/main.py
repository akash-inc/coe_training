from datetime import date, datetime, timezone

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Task(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: int
    due_date: date
    created_at: datetime
    updated_at: datetime


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


@app.get("/")
def read_root():
    return {"Hello": "User"}

@app.get("/tasks")
def read_tasks():
    return list[Task](tasks_db.values())

@app.post("/tasks")
def create_task(task: Task):
    task_id = max(tasks_db.keys()) + 1
    task.id = task_id
    tasks_db[task_id] = task
    return task


@app.get("/tasks/{task_id}")
def read_task(task_id: int):
    task = tasks_db.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.put("/tasks/{task_id}")
async def update_task(task_id: int, task: Task):
    existing_task = tasks_db.get(task_id)
    if existing_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    updated_task = task.model_copy(
        update={
            "id": task_id,
            "created_at": existing_task.created_at,
            "updated_at": datetime.now(timezone.utc),
        }
    )
    tasks_db[task_id] = updated_task
    return updated_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    del tasks_db[task_id]
    return {"message": "Task deleted"}