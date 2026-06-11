from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    completed: bool = False


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    completed: bool | None = None


class Task(BaseModel):
    id: int
    title: str
    description: str
    completed: bool


_tasks: list[Task] = [
    Task(id=1, title="Task 1", description="Task 1 description", completed=False),
]
_next_id = 2


def list_tasks() -> list[Task]:
    return list(_tasks)


def get_task(task_id: int) -> Task | None:
    return next((task for task in _tasks if task.id == task_id), None)


def task_exists(task_id: int) -> bool:
    return get_task(task_id) is not None


def create_task(payload: TaskCreate) -> Task:
    global _next_id
    task = Task(
        id=_next_id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        completed=payload.completed,
    )
    _tasks.append(task)
    _next_id += 1
    return task


def update_task(task_id: int, payload: TaskUpdate) -> Task:
    task = get_task(task_id)
    if task is None:
        raise LookupError("Task not found")

    changes = payload.model_dump(exclude_unset=True)
    if "title" in changes and changes["title"] is not None:
        changes["title"] = changes["title"].strip()
    updated = task.model_copy(update=changes)
    index = _tasks.index(task)
    _tasks[index] = updated
    return updated


def delete_task(task_id: int) -> None:
    task = get_task(task_id)
    if task is None:
        raise LookupError("Task not found")
    _tasks.remove(task)


def reset_tasks() -> None:
    global _next_id
    _tasks.clear()
    _tasks.append(Task(id=1, title="Task 1", description="Task 1 description", completed=False))
    _next_id = 2
