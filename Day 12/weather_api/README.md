# Day 12 — Weather Dashboard API

A FastAPI backend that fetches weather from OpenWeatherMap, caches responses in Redis, and stores user weather preferences in PostgreSQL.

## What you learn

- Cache-first reads with Redis
- External HTTP integration (OpenWeatherMap) with explicit error mapping
- Repository pattern for preference persistence
- Mocking external dependencies in unit tests
- Full request–response integration tests against PostgreSQL

## Project structure

- `app/main.py` — FastAPI routes and error mapping
- `app/services/weather.py` — OpenWeatherMap integration
- `app/services/cache.py` — Redis cache layer
- `app/database.py` — PostgreSQL engine and sessions
- `app/models.py` — `UserPreference` model
- `app/repositories.py` — repository interface and SQLAlchemy implementation
- `tests/` — unit and integration tests
- `.env.example` — environment variable template

## Prerequisites

- Python 3.11+
- PostgreSQL (`psql`)
- Redis (for cache behavior in development)
- OpenWeatherMap API key

## Setup

From `Day 12/weather_api`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cp .env.example .env
```

Edit `.env` with your API key and database credentials.

## Database (PostgreSQL)

```bash
psql -U postgres -c "CREATE DATABASE weather;"
psql -U postgres -c "CREATE DATABASE weather_test;"
```

Tables are created on app startup via `Base.metadata.create_all`.

## Redis (macOS example)

```bash
brew install redis
brew services start redis
redis-cli ping
```

Expected: `PONG`

## Run the API

```bash
uvicorn app.main:app --reload
```

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`

## Verify cache hit vs API call

The `/weather` response includes `source`:

- `"api"` — fetched from OpenWeatherMap
- `"cache"` — returned from Redis

Call the same city and units twice; the second response should be `"cache"` when Redis is available.

## Run tests

```bash
python -m pytest
```

- Unit tests mock weather, Redis, and the preference repository.
- Integration tests use `TEST_DATABASE_URL` (default: `weather_test`) with real PostgreSQL persistence.

Coverage threshold is configured in `pytest.ini` (minimum 90%).

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/weather` | Current weather (cache-first) |
| PUT | `/preferences` | Create or update preferences |
| GET | `/preferences/{user_id}` | Read preferences |

## Troubleshooting

- **Always `"source": "api"`** — Redis not running or wrong `REDIS_URL`; run `redis-cli ping`.
- **OpenWeatherMap failures** — Check `OPENWEATHERMAP_API_KEY` in `.env` and restart the server.
- **Database connection errors** — Confirm PostgreSQL is running and `WEATHER_DATABASE_URL` matches your setup.
- **Import warnings** — Select `Day 12/weather_api/.venv/bin/python` as the interpreter.

## Further reading

See [RESOURCES.md](RESOURCES.md).
