from datetime import datetime, timezone

import pytest
from sqlalchemy.exc import IntegrityError

from models import Task, User
from repositories import SqlAlchemyTaskRepository, SqlAlchemyUserRepository


@pytest.mark.asyncio
async def test_user_create_rolls_back_on_integrity_error_and_recovers(db_session):
    user_repository = SqlAlchemyUserRepository(db_session)

    first_user = User(
        name="Akash One",
        email="akash@example.com",
        created_at=datetime.now(timezone.utc),
    )
    await user_repository.create(first_user)

    duplicate_user = User(
        name="Akash Duplicate",
        email="akash@example.com",
        created_at=datetime.now(timezone.utc),
    )
    with pytest.raises(IntegrityError):
        await user_repository.create(duplicate_user)

    recovered_user = User(
        name="Akash Two",
        email="akash2@example.com",
        created_at=datetime.now(timezone.utc),
    )
    created_user = await user_repository.create(recovered_user)

    assert created_user.id is not None
    users = await user_repository.list_all()
    assert len(users) == 2


@pytest.mark.asyncio
async def test_task_create_rolls_back_on_fk_error_and_recovers(db_session):
    user_repository = SqlAlchemyUserRepository(db_session)
    task_repository = SqlAlchemyTaskRepository(db_session)
    now = datetime.now(timezone.utc)

    invalid_task = Task(
        title="Invalid FK Task",
        description="should fail",
        status="open",
        priority=1,
        due_date=None,
        created_at=now,
        updated_at=now,
        user_id=9999,
    )
    with pytest.raises(IntegrityError):
        await task_repository.create(invalid_task)

    owner = await user_repository.create(
        User(
            name="Task Owner",
            email="owner@example.com",
            created_at=datetime.now(timezone.utc),
        )
    )
    valid_task = Task(
        title="Valid Task",
        description="after rollback",
        status="open",
        priority=2,
        due_date=None,
        created_at=now,
        updated_at=now,
        user_id=owner.id,
    )
    created_task = await task_repository.create(valid_task)

    assert created_task.id is not None
    tasks = await task_repository.list_all()
    assert len(tasks) == 1


@pytest.mark.asyncio
async def test_task_replace_rolls_back_on_fk_error_and_keeps_original_state(db_session):
    user_repository = SqlAlchemyUserRepository(db_session)
    task_repository = SqlAlchemyTaskRepository(db_session)
    now = datetime.now(timezone.utc)

    owner = await user_repository.create(
        User(
            name="Owner",
            email="replace-owner@example.com",
            created_at=datetime.now(timezone.utc),
        )
    )
    owner_id = owner.id
    task = await task_repository.create(
        Task(
            title="Original Title",
            description="original",
            status="open",
            priority=3,
            due_date=None,
            created_at=now,
            updated_at=now,
            user_id=owner_id,
        )
    )
    task_id = task.id

    with pytest.raises(IntegrityError):
        await task_repository.replace(
            task_id,
            {
                "title": "Should Fail",
                "description": "bad owner",
                "status": "in_progress",
                "priority": 4,
                "due_date": None,
                "updated_at": datetime.now(timezone.utc),
                "user_id": 12345,
            },
        )

    recovered_task = await task_repository.replace(
        task_id,
        {
            "title": "Recovered Title",
            "description": "valid update",
            "status": "done",
            "priority": 5,
            "due_date": None,
            "updated_at": datetime.now(timezone.utc),
                "user_id": owner_id,
        },
    )

    assert recovered_task.title == "Recovered Title"
    assert recovered_task.status == "done"
