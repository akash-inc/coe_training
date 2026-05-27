# Weather Dashboard API (Day 12)

This is a FastAPI backend project that fetches weather from OpenWeatherMap, caches responses in Redis, and stores user weather preferences in SQLite.

If you are new to backend development, here is the mental model:
- A client calls an endpoint like `/weather?city=Ahmedabad`
- The API first checks Redis cache
- If cache miss, API calls OpenWeatherMap and then stores result in Redis
- Preferences are saved/retrieved from SQLite via SQLAlchemy

## Project Structure

- `app/main.py` - FastAPI routes and error mapping
- `app/services/weather.py` - OpenWeatherMap integration via `requests`
- `app/services/cache.py` - Redis cache access layer
- `app/database.py` - SQLAlchemy engine/session setup
- `app/models.py` - DB model (`UserPreference`)
- `app/repositories.py` - repository interface + SQLAlchemy implementation for preferences
- `tests/` - mocked tests for API/service/cache behavior
- `.env.example` - environment variables template

## Features Implemented

- `GET /health` basic health endpoint
- `GET /weather` with cache-first strategy
- `PUT /preferences` create/update user preferences
- `GET /preferences/{user_id}` read preferences
- Explicit handling for:
  - weather timeout and upstream failures
  - city not found
  - Redis read/write failures
  - DB integrity and generic DB errors

## Repository Pattern (Why and How)

This project now uses a repository layer for preference persistence:

- Route handlers in `app/main.py` depend on `UserPreferenceRepository`
- Concrete DB logic is in `SqlAlchemyUserPreferenceRepository`
- This keeps API code focused on HTTP behavior and keeps database details in one place

Benefits:
- easier testing (mock repository instead of mocking SQLAlchemy chains)
- cleaner separation of concerns
- easier future swap to another storage backend

## Environment Variables

Create `.env` in this folder (`Day 12/weather_api/.env`) using:

```env
OPENWEATHERMAP_API_KEY=your_api_key_here
REDIS_URL=redis://localhost:6379/0
WEATHER_DATABASE_URL=sqlite:///./weather.db
```

`python-dotenv` is used in `app/services/weather.py`, so env values are loaded from `.env`.

## Install

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Run the API

```bash
uvicorn app.main:app --reload
```

Open docs:
- `http://127.0.0.1:8000/docs`

## Verify Cache Hit vs API Call

The `/weather` response includes a `source` field:
- `"source": "api"` -> fetched from OpenWeatherMap
- `"source": "cache"` -> returned from Redis

Call the same request twice (same city + same units):
1) first call normally returns `api`
2) second call should return `cache`

## Redis Setup (macOS)

If you see `redis-cli: command not found`, install Redis:

```bash
brew install redis
brew services start redis
redis-cli ping
```

Expected output: `PONG`

## Test Strategy

Tests in this project are designed to teach mocking external dependencies:
- OpenWeatherMap (`requests`)
- Redis (`redis.Redis`)
- Repository-backed DB operations (mocked `UserPreferenceRepository`)

Key files:
- `tests/conftest.py` - reusable fixtures and dependency overrides
- `tests/test_weather.py` - weather service unit tests
- `tests/test_cache.py` - cache unit tests
- `tests/test_main.py` - route tests and error-path tests
- `tests/test_repositories.py` - repository unit tests (create/update/error branches)

Advanced mocking already included:
- `mocker.spy(...)`
- `mocker.patch.object(...)`

## Run Tests + Coverage

```bash
python -m pytest
```

Coverage settings are in `pytest.ini`:
- minimum required: 90%
- current implementation was validated above target

## Common Troubleshooting

- **Always seeing `"source": "api"`**
  - Redis is not running, unreachable, or wrong `REDIS_URL`
  - Try `redis-cli ping` and verify same Redis DB index in URL

- **OpenWeatherMap failing**
  - Missing or invalid `OPENWEATHERMAP_API_KEY`
  - Check `.env` and restart server

- **Import warnings in editor**
  - Select interpreter: `Day 12/weather_api/.venv/bin/python`

## Beginner Next Steps

- Add TTL configuration via environment variable
- Add endpoint for deleting preferences
- Add structured logging around cache hit/miss
- Replace sync HTTP call with async client (`httpx`) if you want fully async flow
