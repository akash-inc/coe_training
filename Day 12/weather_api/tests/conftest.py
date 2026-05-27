from collections.abc import Generator
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.main import app, get_cache_service, get_preference_repository, get_weather_service
from app.repositories import UserPreferenceRepository
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
