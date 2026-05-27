from collections.abc import Generator
from contextlib import contextmanager
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.main import app, get_cache_service, get_db, get_weather_service


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


@contextmanager
def _build_integration_client() -> Generator[TestClient, None, None]:
    db_path = Path(__file__).resolve().parent / "integration_test.db"
    if db_path.exists():
        db_path.unlink()

    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

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
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if db_path.exists():
        db_path.unlink()


def test_weather_endpoint_full_request_response_cycle():
    with _build_integration_client() as client:
        first_response = client.get("/weather", params={"city": "ahmedabad", "units": "metric"})
        assert first_response.status_code == 200
        first_payload = first_response.json()
        assert first_payload["city"] == "Ahmedabad"
        assert first_payload["source"] == "api"

        second_response = client.get("/weather", params={"city": "ahmedabad", "units": "metric"})
        assert second_response.status_code == 200
        second_payload = second_response.json()
        assert second_payload["city"] == "Ahmedabad"
        assert second_payload["source"] == "cache"


def test_preferences_put_then_get_cycle():
    with _build_integration_client() as client:
        create_response = client.put(
            "/preferences",
            json={"user_id": 101, "preferred_city": "Ahmedabad", "units": "metric"},
        )
        assert create_response.status_code == 200
        assert create_response.json() == {
            "user_id": 101,
            "preferred_city": "Ahmedabad",
            "units": "metric",
        }

        fetch_response = client.get("/preferences/101")
        assert fetch_response.status_code == 200
        assert fetch_response.json() == {
            "user_id": 101,
            "preferred_city": "Ahmedabad",
            "units": "metric",
        }


def test_preferences_update_then_get_cycle():
    with _build_integration_client() as client:
        initial_response = client.put(
            "/preferences",
            json={"user_id": 202, "preferred_city": "Delhi", "units": "metric"},
        )
        assert initial_response.status_code == 200

        update_response = client.put(
            "/preferences",
            json={"user_id": 202, "preferred_city": "Mumbai", "units": "imperial"},
        )
        assert update_response.status_code == 200
        assert update_response.json() == {
            "user_id": 202,
            "preferred_city": "Mumbai",
            "units": "imperial",
        }

        fetch_response = client.get("/preferences/202")
        assert fetch_response.status_code == 200
        assert fetch_response.json() == {
            "user_id": 202,
            "preferred_city": "Mumbai",
            "units": "imperial",
        }


def test_preferences_get_missing_returns_404():
    with _build_integration_client() as client:
        response = client.get("/preferences/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Preferences not found"
