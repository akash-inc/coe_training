# Day 15 — Task Manager

FastAPI backend + React/Vite frontend. PostgreSQL via SQLAlchemy. Observability via Sentry and Elastic APM.

## Commands

### Backend
```bash
# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Run dev server (from project root)
uvicorn main:app --reload

# Run tests (requires TEST_DATABASE_URL or local Postgres)
python -m pytest -q

# Run a specific test file
python -m pytest tests/test_tasks_crud.py -q
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build
npm run lint     # ESLint
```

## Environment Setup

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

**Required env vars (app will fail loudly if missing):**
- `DATABASE_URL` — PostgreSQL connection string. Normalized automatically from `postgres://` or `postgresql://` to `postgresql+psycopg://`.
- `JWT_SECRET` — Must not be the default `"your-secret-key"`. Use a strong random value.

**Test database:**
- Set `TEST_DATABASE_URL` (defaults to a local Postgres URL with credentials from `.env.example`).
- The test suite creates the database if it doesn't exist, runs Alembic migrations, and truncates between tests.
- Tests disable Sentry and Elastic APM automatically via `conftest.py`.

## Architecture

### Backend conventions

- **No direct `os.environ` reads.** All configuration goes through getter functions in `config.py` (e.g., `get_database_url()`, `get_sentry_dsn()`). The only exception is `conftest.py`, which sets env vars to provision test infrastructure.
- **Repository pattern.** Route handlers depend on `TaskRepository` and `CommentRepository` abstract interfaces, never on SQLAlchemy sessions directly. Concrete implementations (`SqlAlchemyTaskRepository`, `SqlAlchemyCommentRepository`) are in `repositories.py` and injected via FastAPI `Depends`.
- **Pydantic/ORM separation.** `models/` holds pure Pydantic schemas for API request/response. `orm_models.py` holds SQLAlchemy models. Never mix them.
- **Structured logging.** All events use `logger.*(msg, extra={"event": "domain.action", ...})`. No bare `print()` calls. The `event` field is required for log routing.
- **Auth.** JWT access tokens (short-lived) + in-memory refresh tokens. Credential validation and token decode logic live in `auth.py`. Route handlers call `verify_credentials()` and `get_current_user()`.

### Frontend conventions

- **No direct `import.meta.env` in components or API files.** All env var access is isolated to `frontend/src/lib/` modules (`apiBase.js`, `elasticApm.js`, `sentry.js`).
- **Query keys are centralized in `queryKeys.js`.** Use `queryKeys.tasks`, `queryKeys.comments(taskId)`, `queryKeys.commentsAll`, `queryKeys.me` everywhere. Never use raw string arrays.
- **All HTTP calls go through `apiFetch` in `apiClient.js`**, which handles auth token injection and token refresh. The one exception is `api/auth.js`, which handles unauthenticated flows (login/logout) and calls `fetch` directly.
- **Optimistic update helpers** are pure functions in `frontend/src/lib/commentsCache.js`. Keep cache mutation logic there, not inline in components.

## Key Files

| File | Purpose |
|---|---|
| `main.py` | FastAPI app, all routes, startup lifespan |
| `auth.py` | JWT creation, refresh tokens, credential verification, Pydantic auth models |
| `repositories.py` | Repository ABCs + SQLAlchemy implementations |
| `models/tasks.py`, `models/comments.py` | Pydantic API schemas |
| `orm_models.py` | SQLAlchemy ORM models |
| `config.py` | All env var access; also exports `SENSITIVE_HEADER_NAMES` |
| `logging_config.py` | JSON formatter, request logging middleware |
| `tracing.py` | Request ID / trace ID context vars and helpers |
| `sentry_config.py` | Sentry init and scrubbing |
| `elastic_apm_config.py` | Elastic APM init and `repository_span` context manager |
| `health.py` | `/ready` and `/health` probe logic |
| `alerting.py` | `report_critical_error()` — tags Sentry events for on-call routing |
| `comment_ws.py` | WebSocket message builders and incoming message handler |
| `connection_manager.py` | In-memory WebSocket room registry |
| `tests/conftest.py` | Shared fixtures: DB engine, per-test truncate/seed, test client, telemetry disable |
| `frontend/src/lib/apiClient.js` | Fetch wrapper with auth injection and token refresh |
| `frontend/src/lib/commentsCache.js` | Pure functions for optimistic comment cache mutations |
| `frontend/src/lib/observability-utils.js` | Shared `parseSampleRate` helper for APM and Sentry |
| `frontend/src/api/queryKeys.js` | React Query cache key factory |

## Constants

- `models/comments.py::COMMENT_BODY_MAX_LENGTH = 1000` — single source for comment body length limit; used in Pydantic `Field` constraints and repository validation.
- `config.py::SENSITIVE_HEADER_NAMES` — shared by `logging_config.py` and `sentry_config.py` for header scrubbing.
