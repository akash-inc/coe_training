import asyncio
import os
from collections.abc import AsyncGenerator
from pathlib import Path

import asyncpg
import pytest
import pytest_asyncio
from alembic import command
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from database import get_db
from main import app

PROJECT_ROOT = Path(__file__).resolve().parents[1]
TEST_DB_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://akash:password@localhost/tasks_test",
)


async def _ensure_postgres_test_db_exists(url: str) -> None:
    parsed_url = make_url(url)
    db_name = parsed_url.database
    if not db_name:
        raise RuntimeError("TEST_DATABASE_URL must include a database name")

    conn = await asyncpg.connect(
        host=parsed_url.host or "localhost",
        port=parsed_url.port or 5432,
        user=parsed_url.username,
        password=parsed_url.password,
        database="postgres",
    )
    try:
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            db_name,
        )
        if not exists:
            escaped_db_name = db_name.replace('"', '""')
            await conn.execute(f'CREATE DATABASE "{escaped_db_name}"')
    finally:
        await conn.close()


@pytest.fixture(scope="session")
def migrated_test_db():
    asyncio.run(_ensure_postgres_test_db_exists(TEST_DB_URL))

    alembic_cfg = Config(str(PROJECT_ROOT / "alembic.ini"))
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DB_URL)
    command.upgrade(alembic_cfg, "head")
    yield
    command.downgrade(alembic_cfg, "base")


@pytest_asyncio.fixture(scope="session")
async def engine(migrated_test_db):
    test_engine = create_async_engine(TEST_DB_URL, future=True)
    yield test_engine
    await test_engine.dispose()


@pytest_asyncio.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        await session.execute(text("TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE"))
        await session.commit()

        yield session

        await session.execute(text("TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE"))
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
