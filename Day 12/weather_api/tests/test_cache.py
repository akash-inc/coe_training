import pytest
import redis

from app.services.cache import CacheService, CacheServiceError


def test_cache_get_returns_none_on_miss(mocker):
    mock_client = mocker.Mock()
    mock_client.get.return_value = None
    mocker.patch("app.services.cache.redis.Redis.from_url", return_value=mock_client)

    cache = CacheService(redis_url="redis://fake")
    assert cache.get("weather:london") is None


def test_cache_get_returns_dict_for_valid_json(mocker):
    mock_client = mocker.Mock()
    mock_client.get.return_value = '{"city":"London","temperature":20}'
    mocker.patch("app.services.cache.redis.Redis.from_url", return_value=mock_client)

    cache = CacheService(redis_url="redis://fake")
    assert cache.get("weather:london") == {"city": "London", "temperature": 20}


def test_cache_get_returns_none_for_non_dict_json(mocker):
    mock_client = mocker.Mock()
    mock_client.get.return_value = '["not","a","dict"]'
    mocker.patch("app.services.cache.redis.Redis.from_url", return_value=mock_client)

    cache = CacheService(redis_url="redis://fake")
    assert cache.get("weather:london") is None


def test_cache_get_returns_none_for_invalid_json(mocker):
    mock_client = mocker.Mock()
    mock_client.get.return_value = "{invalid-json"
    mocker.patch("app.services.cache.redis.Redis.from_url", return_value=mock_client)

    cache = CacheService(redis_url="redis://fake")
    assert cache.get("weather:london") is None


def test_cache_get_raises_on_redis_error(mocker):
    mock_client = mocker.Mock()
    mock_client.get.side_effect = redis.RedisError("down")
    mocker.patch("app.services.cache.redis.Redis.from_url", return_value=mock_client)

    cache = CacheService(redis_url="redis://fake")
    with pytest.raises(CacheServiceError, match="read from cache"):
        cache.get("weather:london")


def test_cache_set_raises_on_non_serializable_value(mocker):
    mock_client = mocker.Mock()
    mocker.patch("app.services.cache.redis.Redis.from_url", return_value=mock_client)

    cache = CacheService(redis_url="redis://fake")
    with pytest.raises(CacheServiceError, match="write to cache"):
        cache.set("weather:key", {"bad": object()})


def test_cache_set_raises_on_redis_error(mocker):
    mock_client = mocker.Mock()
    mock_client.setex.side_effect = redis.RedisError("down")
    mocker.patch("app.services.cache.redis.Redis.from_url", return_value=mock_client)

    cache = CacheService(redis_url="redis://fake")
    with pytest.raises(CacheServiceError, match="write to cache"):
        cache.set("weather:key", {"city": "London"})


def test_cache_set_writes_serialized_value(mocker):
    mock_client = mocker.Mock()
    mocker.patch("app.services.cache.redis.Redis.from_url", return_value=mock_client)

    cache = CacheService(redis_url="redis://fake")
    spy = mocker.spy(mock_client, "setex")
    cache.set("weather:key", {"city": "London"}, ttl_seconds=120)

    spy.assert_called_once()
