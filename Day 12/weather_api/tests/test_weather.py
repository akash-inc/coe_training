import pytest
import requests

from app.services.weather import CityNotFoundError, UpstreamServiceError, WeatherService


class DummyResponse:
    def __init__(self, status_code: int, payload=None):
        self.status_code = status_code
        self._payload = payload if payload is not None else {}

    def json(self):
        return self._payload


def test_get_current_weather_success(mocker):
    service = WeatherService(api_key="test-key")
    mocker.patch(
        "app.services.weather.requests.get",
        return_value=DummyResponse(
            200,
            {
                "name": "London",
                "main": {"temp": 21.5},
                "weather": [{"main": "Clear"}],
            },
        ),
    )

    result = service.get_current_weather("London")
    assert result["city"] == "London"
    assert result["temperature"] == 21.5
    assert result["condition"] == "Clear"
    assert result["units"] == "metric"
    assert "observed_at" in result


def test_get_current_weather_raises_when_api_key_missing(monkeypatch):
    monkeypatch.delenv("OPENWEATHERMAP_API_KEY", raising=False)
    service = WeatherService(api_key=None)
    with pytest.raises(UpstreamServiceError, match="Missing OPENWEATHERMAP_API_KEY"):
        service.get_current_weather("London")


def test_get_current_weather_timeout(mocker):
    service = WeatherService(api_key="test-key")
    mocker.patch("app.services.weather.requests.get", side_effect=requests.Timeout)

    with pytest.raises(UpstreamServiceError, match="timed out"):
        service.get_current_weather("London")


def test_get_current_weather_request_exception(mocker):
    service = WeatherService(api_key="test-key")
    mocker.patch("app.services.weather.requests.get", side_effect=requests.RequestException)

    with pytest.raises(UpstreamServiceError, match="request failed"):
        service.get_current_weather("London")


def test_get_current_weather_city_not_found(mocker):
    service = WeatherService(api_key="test-key")
    mocker.patch("app.services.weather.requests.get", return_value=DummyResponse(404))

    with pytest.raises(CityNotFoundError, match="not found"):
        service.get_current_weather("NoSuchCity")


def test_get_current_weather_server_error(mocker):
    service = WeatherService(api_key="test-key")
    mocker.patch("app.services.weather.requests.get", return_value=DummyResponse(500))

    with pytest.raises(UpstreamServiceError, match="server error"):
        service.get_current_weather("London")


def test_get_current_weather_unexpected_status(mocker):
    service = WeatherService(api_key="test-key")
    mocker.patch("app.services.weather.requests.get", return_value=DummyResponse(418))

    with pytest.raises(UpstreamServiceError, match="unexpected status 418"):
        service.get_current_weather("London")


def test_get_current_weather_malformed_payload(mocker):
    service = WeatherService(api_key="test-key")
    mocker.patch("app.services.weather.requests.get", return_value=DummyResponse(200, {"name": "London"}))

    with pytest.raises(UpstreamServiceError, match="Malformed OpenWeatherMap response"):
        service.get_current_weather("London")
