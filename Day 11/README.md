# Day 11 — FastAPI Task Management (Full-Stack)

A task management app with JWT authentication, role-based access control, optional GitHub OAuth, per-user rate limiting, a FastAPI backend (async SQLAlchemy + PostgreSQL), and a Vite + React frontend.

## What you learn

- FastAPI request/response validation with Pydantic
- Async SQLAlchemy (`AsyncSession`) against PostgreSQL
- Repository pattern to keep route handlers thin
- Alembic migrations for versioned schema changes
- JWT access tokens, refresh tokens, and logout
- Role-based permissions (`admin`, `editor`, `viewer`)
- GitHub OAuth2 authorization-code flow
- Per-user rate limiting with SlowAPI
- Security headers and HTTPS considerations for production APIs
- Async API testing with pytest and a real PostgreSQL test database
- Vite + React UI with a small hooks-based frontend architecture

## Project structure

```
Day 11/
├── main.py                 # FastAPI app, routes, CORS, static UI mount
├── auth.py                 # Password hashing, JWT, get_current_user
├── permissions.py          # Role → permission map, require_permission()
├── rate_limit.py           # SlowAPI limiter, per-user key function
├── github_oauth.py         # GitHub token exchange and profile fetch
├── github_auth.py          # Link or create local users from GitHub
├── models.py               # SQLAlchemy models (User, Task, RefreshToken)
├── database.py             # Async engine and session factory
├── repositories.py         # Repository interfaces and implementations
├── alembic/                # Migration versions
├── alembic.ini
├── requirements.txt        # Runtime Python dependencies
├── requirements-dev.txt    # pytest and dev tooling
├── pytest.ini
├── RESOURCES.md            # External documentation links
├── tests/
│   ├── conftest.py         # DB fixtures, auth helpers, rate-limit bypass
│   ├── test_health.py
│   ├── test_users.py
│   ├── test_tasks.py
│   ├── test_dashboard.py
│   ├── test_permissions.py
│   ├── test_refresh_token.py
│   ├── test_github_oauth.py
│   ├── test_rate_limit.py
│   └── test_repository_transactions.py
└── frontend/               # Vite + React SPA
    ├── src/
    │   ├── App.tsx         # Route shell: auth, OAuth callback, dashboard
    │   ├── api.ts          # Typed API endpoint functions
    │   ├── lib/httpClient.ts  # Token storage, fetch wrapper, 401 refresh
    │   ├── hooks/          # usePathname, useToast, useAppData, useSession
    │   ├── auth/           # GitHub callback query parsing
    │   ├── components/     # Auth, dashboard, tasks, users, toast UI
    │   ├── permissions.ts  # Frontend permission checks
    │   └── types.ts
    ├── vite.config.ts      # Dev proxy to API on port 8000
    └── package.json
```

## Prerequisites

- Python 3.11+
- Node.js 20+ (for the frontend)
- PostgreSQL running locally (`psql` available)

## Setup

From `Day 11`:

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

Edit `.env` if your PostgreSQL user, password, or host differ from the defaults.

## Environment variables

Copy `.env.example` to `.env`. Key settings:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | App database for FastAPI and Alembic |
| `TEST_DATABASE_URL` | Isolated database for pytest |
| `JWT_SECRET` | Signs access tokens and OAuth state |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime (default `15`) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime (default `7`) |
| `CORS_ORIGINS` | Comma-separated Vite dev origins |
| `FRONTEND_URL` | Where the API redirects after GitHub OAuth |
| `GITHUB_REDIRECT_URI` | Must match your GitHub OAuth App callback URL |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional; leave blank to hide GitHub sign-in |
| `RATE_LIMIT_DEFAULT` | Per-user limit on protected routes (default `100/minute`) |
| `RATE_LIMIT_LOGIN` | IP-based limit on `POST /token` (default `10/minute`) |
| `RATE_LIMIT_REGISTER` | IP-based limit on `POST /users` (default `5/minute`) |
| `RATE_LIMIT_ENABLED` | Set to `false` to disable all rate limits |

Use `localhost` or `127.0.0.1` consistently in the browser, `.env`, and GitHub OAuth App settings. They are different browser origins.

## Database (PostgreSQL)

Create the application and test databases:

```bash
psql -U postgres -c "CREATE DATABASE tasks;"
psql -U postgres -c "CREATE DATABASE tasks_test;"
```

Apply migrations to the app database:

```bash
alembic upgrade head
```

Pytest migrates `TEST_DATABASE_URL` automatically and tears it down after the session. The app database is not modified by tests.

## Run (development)

Use two terminals.

**Terminal 1 — API** (from `Day 11`):

```bash
uvicorn main:app --reload
```

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

**Terminal 2 — Frontend** (from `Day 11/frontend`):

```bash
npm run dev
```

- UI: `http://localhost:5173` or `http://127.0.0.1:5173`

The Vite dev server proxies API routes (`/users`, `/tasks`, `/token`, `/dashboard`, `/auth/github`, etc.) to port 8000. `/auth/callback` is a frontend route handled by React, not proxied to the API.

Restart uvicorn after changing `.env`.

## Run (production-style, single server)

Build the UI and serve it from FastAPI:

```bash
cd frontend && npm run build && cd ..
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000` for the app (requires `frontend/dist` to exist).

## Run tests

From `Day 11`:

```bash
python -m pytest
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

CI runs both on pushes/PRs that touch `Day 11/**` (see `.github/workflows/day11-ci.yaml`).

## Authentication

### Email / password

1. Register via the UI or `POST /users`.
2. Log in with `POST /token` (OAuth2 password form: `username` = email).
3. Use the access token as `Authorization: Bearer <token>`.
4. Refresh with `POST /token/refresh` and log out with `POST /logout`.

Logging in revokes previous refresh tokens for that user (one active session per user).

### GitHub OAuth (optional)

1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Set **Homepage URL** to your frontend origin (e.g. `http://localhost:5173`)
3. Set **Authorization callback URL** to `GITHUB_REDIRECT_URI` (e.g. `http://localhost:8000/auth/github/callback`)
4. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env`
5. Restart the API and open the UI — **Sign in with GitHub** appears when configured

Flow: UI → `/auth/github/login` → GitHub → `/auth/github/callback` (API) → `/auth/callback` (frontend with tokens) → dashboard.

## Roles and permissions

| Role | Capabilities |
|------|--------------|
| `admin` | Full user and task management; view any user's tasks via `GET /tasks?user_id=` |
| `editor` | Create, read, update, delete own tasks; list users |
| `viewer` | Read own tasks and list users; no writes |

New email registrations default to `editor`. GitHub-only users have no password hash.

## Rate limiting

SlowAPI limits requests using `rate_limit.py`:

- **Authenticated routes** (`/me`, `/tasks`, `/dashboard`, etc.): keyed by JWT `sub` (`user:{id}`), so each user has their own quota.
- **Login and registration** (`POST /token`, `POST /users`): keyed by client IP to slow brute-force and spam signups.
- **`/health`**: exempt from limits.

When a limit is exceeded the API returns `429 Too Many Requests`. Limits are configurable via the `RATE_LIMIT_*` env vars above.

## Security headers and HTTPS

This project does not add security headers in code. In production you typically set them at a reverse proxy (nginx, Caddy, Cloudflare) or via middleware. Brief overview:

| Header | Purpose |
|--------|---------|
| `Strict-Transport-Security` (HSTS) | Tells browsers to use HTTPS only for a period. Enable only when the site is served over HTTPS. |
| `X-Content-Type-Options: nosniff` | Stops browsers from MIME-sniffing responses away from the declared `Content-Type`. |
| `X-Frame-Options: DENY` or `SAMEORIGIN` | Reduces clickjacking by controlling whether the page can be embedded in frames. |
| `Content-Security-Policy` (CSP) | Restricts where scripts, styles, and connections may load from. Tune per app (Vite build vs API JSON). |
| `Referrer-Policy` | Limits how much URL information is sent in the `Referer` header on navigation. |
| `Permissions-Policy` | Disables browser features (camera, geolocation, etc.) the app does not need. |

**HTTPS considerations:**

- Terminate TLS at a load balancer or reverse proxy; run uvicorn behind it on HTTP locally or with a Unix socket.
- Set `JWT_SECRET` and database credentials from a secrets manager, not source control.
- Use `Secure` and `HttpOnly` cookies if you move tokens from `localStorage` to cookies.
- Trust `X-Forwarded-Proto` / `X-Forwarded-For` only from your proxy when inferring HTTPS or client IP (relevant for rate limits behind nginx).
- Keep CORS `allow_origins` explicit; avoid `*` when `allow_credentials=True`.

For local dev, HTTP on `127.0.0.1` is normal. Apply HSTS and strict CSP when you deploy behind HTTPS.

## API endpoints

| Method | Path | Auth | Rate limit | Description |
|--------|------|------|------------|-------------|
| GET | `/health` | — | exempt | Health / welcome |
| POST | `/users` | — | register (IP) | Register user |
| POST | `/token` | — | login (IP) | Login (access + refresh tokens) |
| POST | `/token/refresh` | — | default | Refresh access token |
| POST | `/logout` | — | default | Revoke refresh token |
| GET | `/me` | Bearer | per user | Current user |
| GET | `/dashboard` | Bearer | per user | User profile + task counts |
| GET | `/auth/github/enabled` | — | default | Whether GitHub OAuth is configured |
| GET | `/auth/github/login` | — | default | Redirect to GitHub |
| GET | `/auth/github/callback` | — | default | GitHub OAuth callback (API) |
| GET | `/users` | Bearer + `users:read` | per user | List users |
| DELETE | `/users/{user_id}` | Bearer + `users:delete` | per user | Delete user (admin) |
| GET | `/tasks` | Bearer + `tasks:read` | per user | List tasks (`?user_id=` for admin) |
| POST | `/tasks` | Bearer + `tasks:write` | per user | Create task |
| GET | `/tasks/{task_id}` | Bearer + `tasks:read` | per user | Get task |
| PUT | `/tasks/{task_id}` | Bearer + `tasks:write` | per user | Replace task (full body) |
| PATCH | `/tasks/{task_id}` | Bearer + `tasks:write` | per user | Partial task update |
| DELETE | `/tasks/{task_id}` | Bearer + `tasks:delete` | per user | Delete task |

## Frontend features

- Email register / login with automatic token refresh on 401
- Optional GitHub sign-in
- Dashboard with task counts
- Task list with create, edit (PUT), status patch, and delete
- Role-aware UI (viewers see read-only controls)
- Admin user panel: select a user to view their tasks
- Toast feedback for success and errors

## Why `PUT` and `PATCH` are separate

- `PUT` replaces the full task representation (client sends all required fields).
- `PATCH` updates only fields present in the request body (used for quick status changes in the UI).

## Troubleshooting

- **Import warnings in the editor** — Select `Day 11/.venv/bin/python` as the interpreter.
- **UI cannot reach API in dev** — Ensure uvicorn is running on port 8000 before `npm run dev`.
- **Blank page on port 8000** — Run `npm run build` in `frontend/` so `frontend/dist` exists.
- **Connection refused / authentication failed** — Confirm PostgreSQL is running and `.env` URLs match your local setup.
- **`relation "users" does not exist` / GitHub sign-in fails** — Run `alembic upgrade head` on the `DATABASE_URL` database.
- **GitHub redirect 404 on `/auth/callback`** — Use the Vite dev server (port 5173), not the API (port 8000), for the frontend. Only `/auth/github/*` is proxied to the API.
- **`localhost` vs `127.0.0.1` mismatch** — Keep `FRONTEND_URL`, the browser URL, and GitHub Homepage URL on the same hostname.
- **`429 Too Many Requests`** — You hit a rate limit. Wait a minute or set `RATE_LIMIT_ENABLED=false` in `.env` for local testing.

## Further reading

See [RESOURCES.md](RESOURCES.md) for documentation links and deeper topics.
