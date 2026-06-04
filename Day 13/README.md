# Day 13 — School Management API (N+1 and eager loading)

A FastAPI + SQLAlchemy API for students, courses, and enrollments, with a Vite + React lab UI to stress the backend from many parallel browser clients.

## What you learn

- ORM relationships and the N+1 query problem
- Eager loading strategies: `joinedload`, `selectinload`, `subqueryload`
- Correlated subquery vs `JOIN` + `GROUP BY` (see [docs/course-enrollment-counts-slow-explain.md](docs/course-enrollment-counts-slow-explain.md))
- Bulk seed and bulk update endpoints
- Connection pooling under concurrent requests (`DB_POOL_SIZE`, `DB_MAX_OVERFLOW`)
- PostgreSQL-only persistence with SQL echo controlled by environment

## Project structure

- `app/main.py` — routes, loading-strategy demos, optional static UI mount
- `app/models.py` — `Student`, `Course`, `Enrollment`
- `app/schemas.py` — Pydantic request/response models
- `app/database.py` — PostgreSQL engine, pool settings, sessions
- `frontend/` — Vite + React concurrency lab
- `tests/` — smoke and integration-style API tests
- `docs/` — EXPLAIN ANALYZE notes
- `.env.example` — environment variable template

## Prerequisites

- Python 3.11+
- Node.js 20+ (for the frontend)
- PostgreSQL (`psql`)

## Setup

From `Day 13`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cp .env.example .env

cd frontend
npm install
cd ..
```

Edit `.env` if your PostgreSQL credentials differ.

## Database (PostgreSQL)

```bash
psql -U postgres -c "CREATE DATABASE school;"
psql -U postgres -c "CREATE DATABASE school_test;"
```

Tables are created on app startup (`Base.metadata.create_all` in `main.py`).

## Run (development)

Use two terminals.

**Terminal 1 — API** (from `Day 13/app`):

```bash
cd app
uvicorn main:app --reload
```

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

**Terminal 2 — Frontend** (from `Day 13/frontend`):

```bash
npm run dev
```

- UI: `http://127.0.0.1:5173` (proxies API routes to port 8000)

In the UI: use **Seed large (50 courses × 200 enrollments)** for visible N+1 / subquery pain, set parallel clients (try 10+), then run benchmarks (each run **warms up once**, then records the second). Responses include **`X-Sql-Queries`**. Set `DATABASE_ECHO=true` in `.env` to see the actual SQL.

## Run (production-style, single server)

```bash
cd frontend && npm run build && cd ../app
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000` (requires `frontend/dist`).

## Seed data (curl)

```bash
curl -X POST http://127.0.0.1:8000/populate-all \
  -H "Content-Type: application/json" \
  -d '{
    "reset": true,
    "students": [{
      "name": "Alice Example",
      "age": 20,
      "email": "alice@example.com",
      "phone": "+14155552671",
      "subjects": ["Math"],
      "subject_grades": {"Math": "A"}
    }],
    "courses": [{
      "name": "CS101",
      "description": "Introduction to computer science",
      "subjects": ["Math"]
    }],
    "enrollments": [{"student_ref": 0, "course_ref": 0}]
  }'
```

## Loading strategy endpoints

| Endpoint | Loading behavior |
|----------|------------------|
| `GET /courses-with-students-naive` | Lazy load — N+1 risk |
| `GET /courses-with-students-eager-joinedload` | Single query with joins |
| `GET /courses-with-students-selectin` | Batched `IN` queries |
| `GET /courses-with-students-subquery` | Subquery-based collection load |

## Run tests

From `Day 13`:

```bash
python -m pytest
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health / welcome |
| GET/POST | `/students` | List / upsert students |
| GET/POST | `/courses` | List / upsert courses |
| GET/POST | `/enrollments` | List / upsert enrollments |
| POST | `/populate-all` | Seed students, courses, enrollments |
| POST | `/bulk-update` | Bulk update mappings |
| GET | `/courses-with-students-naive` | Lazy loading demo |
| GET | `/courses-with-students-eager-joinedload` | `joinedload` demo |
| GET | `/courses-with-students-selectin` | `selectinload` demo |
| GET | `/courses-with-students-subquery` | `subqueryload` demo |
| GET | `/report/course-enrollment-counts-slow` | Correlated subquery demo |
| GET | `/report/course-enrollment-counts` | Optimized `JOIN` + `GROUP BY` |

## Troubleshooting

- **Import errors when running uvicorn** — Run from `Day 13/app` so flat imports resolve.
- **UI cannot reach API** — Start uvicorn on port 8000 before `npm run dev`.
- **Blank page on port 8000** — Run `npm run build` in `frontend/`.
- **Connection refused** — Confirm PostgreSQL is running and `.env` URLs are correct.

## Further reading

- [RESOURCES.md](RESOURCES.md) — PostgreSQL slow-query logging, `pg_stat_statements`, profiling articles
- [docs/course-enrollment-counts-slow-explain.md](docs/course-enrollment-counts-slow-explain.md) — slow vs optimized SQL plans
