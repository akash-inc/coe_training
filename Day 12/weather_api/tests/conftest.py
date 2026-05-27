from collections.abc import Generator
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app, get_cache_service, get_db, get_weather_service
from app.services.cache import CacheService
from app.services.weather import WeatherService


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
def mock_db_session() -> Mock:
    return Mock(spec=Session)


@pytest.fixture
def client(
    mock_weather_service: Mock,
    mock_cache_service: Mock,
    mock_db_session: Mock,
) -> Generator[TestClient, None, None]:
    def override_weather_service() -> Mock:
        return mock_weather_service

    def override_cache_service() -> Mock:
        return mock_cache_service

    def override_db() -> Generator[Mock, None, None]:
        yield mock_db_session

    app.dependency_overrides[get_weather_service] = override_weather_service
    app.dependency_overrides[get_cache_service] = override_cache_service
    app.dependency_overrides[get_db] = override_db

    with TestClient(app) as api_client:
        yield api_client

    app.dependency_overrides.clear()
