import json
import os
from typing import Any

import redis


class CacheServiceError(Exception):
    """Raised when cache operations fail."""


class CacheService:
    def __init__(self, redis_url: str | None = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.client = redis.Redis.from_url(self.redis_url, decode_responses=True)

    def get(self, key: str) -> dict[str, Any] | None:
        try:
            raw_value = self.client.get(key)
        except redis.RedisError as error:
            raise CacheServiceError("Failed to read from cache") from error

        if raw_value is None:
            return None

        try:
            parsed = json.loads(raw_value)
            if isinstance(parsed, dict):
                return parsed
            return None
        except json.JSONDecodeError:
            return None

    def set(self, key: str, value: dict[str, Any], ttl_seconds: int = 300) -> None:
        try:
            serialized = json.dumps(value)
            self.client.setex(key, ttl_seconds, serialized)
        except (TypeError, redis.RedisError) as error:
            raise CacheServiceError("Failed to write to cache") from error
