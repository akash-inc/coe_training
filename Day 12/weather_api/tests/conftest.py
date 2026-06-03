import os
from collections.abc import Generator
from contextlib import contextmanager
from unittest.mock import Mock

import psycopg
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.main import app, get_cache_service, get_db, get_preference_repository, get_weather_service
from app.repositories import UserPreferenceRepository
from app.services.cache import CacheService
from app.services.weather import WeatherService

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://akash:password@localhost/weather_test",
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


@pytest.fixture(scope="session")
def integration_test_engine():
    _ensure_postgres_test_db_exists(TEST_DATABASE_URL)
    test_engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=test_engine)
    yield test_engine
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


@pytest.fixture
def mock_weather_service() -> Mock:
    service = Mock(spec=WeatherService)
    service.get_current_weather.return_value = {
        "city": "London",
        "temperature": 18.2,
        "condition": "Clouds",
        "units": "metric",
        "observed_at": "2026-01-01T00:00:00+00:00",
    }
    return service


@pytest.fixture
def mock_cache_service() -> Mock:
    service = Mock(spec=CacheService)
    service.get.return_value = None
    return service


@pytest.fixture
def mock_preference_repository() -> Mock:
    return Mock(spec=UserPreferenceRepository)


@pytest.fixture
def client(
    mock_weather_service: Mock,
    mock_cache_service: Mock,
    mock_preference_repository: Mock,
) -> Generator[TestClient, None, None]:
    def override_weather_service() -> Mock:
        return mock_weather_service

    def override_cache_service() -> Mock:
        return mock_cache_service

    def override_preference_repository() -> Mock:
        return mock_preference_repository

    app.dependency_overrides[get_weather_service] = override_weather_service
    app.dependency_overrides[get_cache_service] = override_cache_service
    app.dependency_overrides[get_preference_repository] = override_preference_repository

    with TestClient(app) as api_client:
        yield api_client

    app.dependency_overrides.clear()


class InMemoryCacheService:
    def __init__(self):
        self._store: dict[str, dict] = {}

    def get(self, key: str):
        return self._store.get(key)

    def set(self, key: str, value: dict, ttl_seconds: int = 300):
        self._store[key] = value


class FakeWeatherService:
    def get_current_weather(self, city: str, units: str = "metric") -> dict:
        return {
            "city": city.title(),
            "temperature": 30.5,
            "condition": "Clear",
            "units": units,
            "observed_at": "2026-01-01T00:00:00+00:00",
        }


@pytest.fixture
def integration_client_fixture(integration_test_engine) -> Generator[TestClient, None, None]:
    with _integration_client(integration_test_engine) as client:
        yield client


@contextmanager
def _integration_client(integration_test_engine) -> Generator[TestClient, None, None]:
    TestingSessionLocal = sessionmaker(
        bind=integration_test_engine,
        autocommit=False,
        autoflush=False,
    )

    with integration_test_engine.connect() as connection:
        connection.execute(text("TRUNCATE TABLE user_preferences RESTART IDENTITY CASCADE"))
        connection.commit()

    cache_service = InMemoryCacheService()
    weather_service = FakeWeatherService()

    def override_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    def override_cache_service():
        return cache_service

    def override_weather_service():
        return weather_service

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_cache_service] = override_cache_service
    app.dependency_overrides[get_weather_service] = override_weather_service

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()

    with integration_test_engine.connect() as connection:
        connection.execute(text("TRUNCATE TABLE user_preferences RESTART IDENTITY CASCADE"))
        connection.commit()
