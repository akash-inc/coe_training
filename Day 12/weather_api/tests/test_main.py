from types import SimpleNamespace

import pytest

from app.repositories import PreferenceConflictError, PreferenceStorageError
from app.services.cache import CacheServiceError
from app.services.weather import CityNotFoundError, UpstreamServiceError


def test_healthcheck_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_weather_returns_cached_data_and_skips_weather_call(client, mock_weather_service, mock_cache_service, mocker):
    mock_cache_service.get.return_value = {
        "city": "Paris",
        "temperature": 19.0,
        "condition": "Clear",
        "units": "metric",
        "observed_at": "2026-01-01T00:00:00+00:00",
    }
    get_spy = mocker.spy(mock_cache_service, "get")

    response = client.get("/weather", params={"city": "Paris"})
    assert response.status_code == 200
    assert response.json()["source"] == "cache"
    get_spy.assert_called_once()
    mock_weather_service.get_current_weather.assert_not_called()


def test_weather_cache_miss_uses_api_and_sets_cache(client, mock_weather_service, mock_cache_service, mocker):
    mock_cache_service.get.return_value = None
    mocker.patch.object(
        mock_weather_service,
        "get_current_weather",
        return_value={
            "city": "Tokyo",
            "temperature": 26.3,
            "condition": "Clouds",
            "units": "metric",
            "observed_at": "2026-01-01T00:00:00+00:00",
        },
    )

    response = client.get("/weather", params={"city": "Tokyo"})
    assert response.status_code == 200
    assert response.json()["source"] == "api"
    mock_cache_service.set.assert_called_once()


def test_weather_handles_cache_read_error(client, mock_weather_service, mock_cache_service):
    mock_cache_service.get.side_effect = CacheServiceError("cache down")
    response = client.get("/weather", params={"city": "London"})

    assert response.status_code == 200
    assert response.json()["source"] == "api"
    mock_weather_service.get_current_weather.assert_called_once()


def test_weather_handles_cache_write_error(client, mock_cache_service):
    mock_cache_service.set.side_effect = CacheServiceError("cache down")
    response = client.get("/weather", params={"city": "London"})

    assert response.status_code == 200
    assert response.json()["source"] == "api"


def test_weather_returns_404_for_unknown_city(client, mock_weather_service):
    mock_weather_service.get_current_weather.side_effect = CityNotFoundError("City not found")
    response = client.get("/weather", params={"city": "Unknown"})

    assert response.status_code == 404
    assert response.json()["detail"] == "City not found"


def test_weather_returns_502_for_upstream_failure(client, mock_weather_service):
    mock_weather_service.get_current_weather.side_effect = UpstreamServiceError("upstream down")
    response = client.get("/weather", params={"city": "London"})

    assert response.status_code == 502
    assert response.json()["detail"] == "upstream down"


def test_upsert_preferences_creates_new_record(client, mock_preference_repository):
    mock_preference_repository.upsert.return_value = SimpleNamespace(
        user_id=1,
        preferred_city="Rome",
        units="metric",
    )

    response = client.put("/preferences", json={"user_id": 1, "preferred_city": "Rome", "units": "metric"})
    assert response.status_code == 200
    assert response.json() == {"user_id": 1, "preferred_city": "Rome", "units": "metric"}
    mock_preference_repository.upsert.assert_called_once_with(
        user_id=1,
        preferred_city="Rome",
        units="metric",
    )


def test_upsert_preferences_updates_existing_record(client, mock_preference_repository):
    mock_preference_repository.upsert.return_value = SimpleNamespace(
        user_id=2,
        preferred_city="Berlin",
        units="imperial",
    )

    response = client.put("/preferences", json={"user_id": 2, "preferred_city": "Berlin", "units": "imperial"})
    assert response.status_code == 200
    assert response.json() == {"user_id": 2, "preferred_city": "Berlin", "units": "imperial"}
    mock_preference_repository.upsert.assert_called_once()


def test_upsert_preferences_returns_409_on_integrity_error(client, mock_preference_repository):
    mock_preference_repository.upsert.side_effect = PreferenceConflictError("conflict")

    response = client.put("/preferences", json={"user_id": 3, "preferred_city": "Madrid", "units": "metric"})
    assert response.status_code == 409


def test_upsert_preferences_returns_500_on_database_error(client, mock_preference_repository):
    mock_preference_repository.upsert.side_effect = PreferenceStorageError("db down")

    response = client.put("/preferences", json={"user_id": 4, "preferred_city": "Dublin", "units": "metric"})
    assert response.status_code == 500


def test_get_preferences_returns_value(client, mock_preference_repository):
    mock_preference_repository.get_by_user_id.return_value = SimpleNamespace(
        user_id=9,
        preferred_city="Lisbon",
        units="metric",
    )

    response = client.get("/preferences/9")
    assert response.status_code == 200
    assert response.json() == {"user_id": 9, "preferred_city": "Lisbon", "units": "metric"}


def test_get_preferences_returns_404_when_missing(client, mock_preference_repository):
    mock_preference_repository.get_by_user_id.return_value = None
    response = client.get("/preferences/99")
    assert response.status_code == 404
    assert response.json()["detail"] == "Preferences not found"


def test_get_preferences_returns_500_on_db_error(client, mock_preference_repository):
    mock_preference_repository.get_by_user_id.side_effect = PreferenceStorageError("query failed")

    response = client.get("/preferences/11")
    assert response.status_code == 500


def test_preferences_validation_error_for_invalid_user_id(client):
    response = client.put("/preferences", json={"user_id": 0, "preferred_city": "Rome", "units": "metric"})
    assert response.status_code == 422


def test_weather_validation_error_for_invalid_units(client):
    response = client.get("/weather", params={"city": "Rome", "units": "kelvin"})
    assert response.status_code == 422
