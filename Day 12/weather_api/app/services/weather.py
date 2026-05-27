import os
from datetime import datetime, timezone

import requests


class WeatherServiceError(Exception):
    """Base class for weather service failures."""


class CityNotFoundError(WeatherServiceError):
    """Raised when upstream reports unknown city."""


class UpstreamServiceError(WeatherServiceError):
    """Raised when upstream is unavailable or malformed."""


class WeatherService:
    def __init__(self, api_key: str | None = None, timeout_seconds: int = 5):
        self.api_key = api_key or os.getenv("OPENWEATHERMAP_API_KEY", "")
        self.timeout_seconds = timeout_seconds
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    def get_current_weather(self, city: str, units: str = "metric") -> dict:
        if not self.api_key:
            raise UpstreamServiceError("Missing OPENWEATHERMAP_API_KEY")

        try:
            response = requests.get(
                self.base_url,
                params={"q": city, "appid": self.api_key, "units": units},
                timeout=self.timeout_seconds,
            )
        except requests.Timeout as error:
            raise UpstreamServiceError("OpenWeatherMap request timed out") from error
        except requests.RequestException as error:
            raise UpstreamServiceError("OpenWeatherMap request failed") from error

        if response.status_code == 404:
            raise CityNotFoundError(f"City '{city}' not found")
        if response.status_code >= 500:
            raise UpstreamServiceError("OpenWeatherMap server error")
        if response.status_code != 200:
            raise UpstreamServiceError(f"OpenWeatherMap unexpected status {response.status_code}")

        try:
            payload = response.json()
            return {
                "city": payload["name"],
                "temperature": payload["main"]["temp"],
                "condition": payload["weather"][0]["main"],
                "units": units,
                "observed_at": datetime.now(timezone.utc).isoformat(),
            }
        except (KeyError, IndexError, TypeError, ValueError) as error:
            raise UpstreamServiceError("Malformed OpenWeatherMap response") from error
