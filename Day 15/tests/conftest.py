import os

# These must be set before any project module is imported.
os.environ["SENTRY_DSN"] = ""
os.environ["ELASTIC_APM_SERVER_URL"] = ""
os.environ.setdefault("JWT_SECRET", "test-only-insecure-secret-do-not-use-in-production")

from collections.abc import Generator
from pathlib import Path

import asyncpg
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from database import get_db
from main import app
from orm_models import TaskModel

PROJECT_ROOT = Path(__file__).resolve().parents[1]
TEST_DB_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://akash:password@localhost/day15_tasks_test",
)


def _ensure_postgres_test_db_exists(url: str) -> None:
    parsed_url = make_url(url)
    db_name = parsed_url.database
    if not db_name:
        raise RuntimeError("TEST_DATABASE_URL must include a database name")

    import asyncio

    async def create_db() -> None:
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

    asyncio.run(create_db())


def _reset_and_seed(session: Session) -> None:
    session.execute(text("TRUNCATE TABLE comments, tasks RESTART IDENTITY CASCADE"))
    session.commit()
    session.add(
        TaskModel(
            id=1,
            title="Task 1",
            description="Task 1 description",
            completed=False,
        )
    )
    session.commit()
    session.execute(text("SELECT setval(pg_get_serial_sequence('tasks', 'id'), 1, true)"))
    session.commit()


@pytest.fixture(scope="session")
def migrated_test_db():
    _ensure_postgres_test_db_exists(TEST_DB_URL)

    alembic_cfg = Config(str(PROJECT_ROOT / "alembic.ini"))
    saved_db_url = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = TEST_DB_URL
    try:
        command.upgrade(alembic_cfg, "head")
        yield
        command.downgrade(alembic_cfg, "base")
    finally:
        if saved_db_url is None:
            os.environ.pop("DATABASE_URL", None)
        else:
            os.environ["DATABASE_URL"] = saved_db_url


@pytest.fixture(scope="session")
def engine(migrated_test_db):
    test_engine = create_engine(TEST_DB_URL)
    yield test_engine
    test_engine.dispose()


@pytest.fixture(scope="session")
def session_factory(engine):
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture(autouse=True)
def disable_external_telemetry(monkeypatch):
    monkeypatch.setenv("SENTRY_DSN", "")
    monkeypatch.setenv("ELASTIC_APM_SERVER_URL", "")
    monkeypatch.setenv("LOG_ENVIRONMENT", "test")


@pytest.fixture(autouse=True)
def reset_db(session_factory):
    with session_factory() as session:
        _reset_and_seed(session)
    yield
    with session_factory() as session:
        session.execute(text("TRUNCATE TABLE comments, tasks RESTART IDENTITY CASCADE"))
        session.commit()


@pytest.fixture
def client(session_factory) -> Generator[TestClient, None, None]:
    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
