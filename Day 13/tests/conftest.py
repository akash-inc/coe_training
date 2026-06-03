import os
from collections.abc import Generator
from pathlib import Path

import psycopg
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

PROJECT_ROOT = Path(__file__).resolve().parents[1]
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://akash:password@localhost/school_test",
)


def _ensure_postgres_test_db_exists(url: str) -> None:
    parsed_url = make_url(url)
    db_name = parsed_url.database
    if not db_name:
        raise RuntimeError("TEST_DATABASE_URL must include a database name")

    conn = psycopg.connect(
        host=parsed_url.host or "localhost",
        port=parsed_url.port or 5432,
        user=parsed_url.username,
        password=parsed_url.password,
        dbname="postgres",
        autocommit=True,
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (db_name,),
            )
            if cursor.fetchone() is None:
                escaped_db_name = db_name.replace('"', '""')
                cursor.execute(f'CREATE DATABASE "{escaped_db_name}"')
    finally:
        conn.close()


_ensure_postgres_test_db_exists(TEST_DATABASE_URL)
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["DATABASE_ECHO"] = "false"

from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture(scope="session")
def test_engine():
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db_session(test_engine) -> Generator[Session, None, None]:
    SessionLocal = sessionmaker(bind=test_engine, expire_on_commit=False)
    session = SessionLocal()
    session.execute(
        text("TRUNCATE TABLE enrollments, courses, students RESTART IDENTITY CASCADE")
    )
    session.commit()

    yield session

    session.execute(
        text("TRUNCATE TABLE enrollments, courses, students RESTART IDENTITY CASCADE")
    )
    session.commit()
    session.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as api_client:
        yield api_client
    app.dependency_overrides.clear()


@pytest.fixture
def populate_payload() -> dict:
    return {
        "reset": True,
        "students": [
            {
                "name": "Alice Example",
                "age": 20,
                "email": "alice@example.com",
                "phone": "+14155552671",
                "subjects": ["Math"],
                "subject_grades": {"Math": "A"},
            }
        ],
        "courses": [
            {
                "name": "CS101",
                "description": "Introduction to computer science",
                "subjects": ["Math"],
            }
        ],
        "enrollments": [{"student_ref": 0, "course_ref": 0}],
    }
