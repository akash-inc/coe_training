import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from database import Base, get_db
from main import app
from models import Task, User

TEST_DB_URL = "sqlite+aiosqlite:///./test_tasks.db"


@pytest_asyncio.fixture(scope="session")
async def engine():
    if os.path.exists("test_tasks.db"):
        os.remove("test_tasks.db")

    test_engine = create_async_engine(TEST_DB_URL, future=True)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield test_engine

    await test_engine.dispose()
    if os.path.exists("test_tasks.db"):
        os.remove("test_tasks.db")


@pytest_asyncio.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        # clean before each test
        await session.execute(delete(Task))
        await session.execute(delete(User))
        await session.commit()

        yield session

        # clean after each test
        await session.execute(delete(Task))
        await session.execute(delete(User))
        await session.commit()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def user_payload_factory():
    def _make(name: str = "Akash", email: str = "akash@example.com") -> dict:
        return {"name": name, "email": email}
    return _make


@pytest.fixture
def task_payload_factory():
    def _make(
        user_id: int,
        title: str = "Learn pytest",
        description: str = "Write tests",
        status: str = "open",
        priority: int = 3,
        due_date: str | None = None,
    ) -> dict:
        payload = {
            "title": title,
            "description": description,
            "status": status,
            "priority": priority,
            "user_id": user_id,
        }
        if due_date is not None:
            payload["due_date"] = due_date
        return payload

    return _make