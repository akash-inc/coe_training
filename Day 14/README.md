# Day 14: API Security, Authentication & Authorization

**Status: Completed**

Implementation lives in **Day 11** (`Training/Day 11`). Day 14 tracks the security curriculum against that codebase.

Full setup, API reference, and troubleshooting: [Day 11/README.md](../Day%2011/README.md).

## Curriculum checklist

| Topic | Type | Done in Day 11 |
|-------|------|----------------|
| JWT authentication in FastAPI | Learn | `auth.py`: `OAuth2PasswordBearer`, `create_access_token`, `get_current_user` |
| User registration and login | Exercise | `POST /users`, `POST /token`; `frontend/src/components/AuthPanel.tsx` |
| Password hashing with bcrypt | Practice | `auth.py`: `hash_password`, `verify_password`; `users.password_hash` |
| Token generation and validation | Learn | JWT `sub` + `exp`; validated on every protected request |
| Protect API routes with authentication | Exercise | `/me`, `/dashboard`, `/users`, `/tasks` require Bearer token |
| Refresh token implementation | Practice | `POST /token/refresh`, `POST /logout`; `RefreshToken` model; `frontend/src/lib/httpClient.ts` auto-refresh on 401 |
| Role-based access control (RBAC) | Learn | `permissions.py`: `admin`, `editor`, `viewer` roles |
| User roles (admin / user) | Exercise | `users.role` column; `require_permission()` on routes |
| Permission-based authorization | Practice | Task ownership + role permissions; admin can view any user's tasks |
| OAuth2 password and bearer flows | Learn | `OAuth2PasswordRequestForm` on login; Bearer on protected routes |
| OAuth2 flow in FastAPI | Exercise | `POST /token` returns access + refresh tokens |
| API rate limiting per user | Practice | `rate_limit.py` + SlowAPI; JWT `sub` key for authenticated routes |
| CORS configuration for production | Learn | `CORSMiddleware` in `main.py`; `CORS_ORIGINS` env var |
| Configure CORS for React frontend | Exercise | Vite proxy in `frontend/vite.config.ts`; CORS for dev origins |
| Security headers and HTTPS considerations | Practice | Documented in [Day 11/README.md](../Day%2011/README.md#security-headers-and-https) (proxy/middleware in production) |

**Bonus (beyond core checklist):** GitHub OAuth2 authorization-code flow (`github_oauth.py`, `github_auth.py`, `frontend/src/auth/githubCallback.ts`).

## What was built

### Authentication

- Register with email/password (`POST /users`) or GitHub OAuth (optional).
- Login returns short-lived access token + DB-stored refresh token.
- `GET /me` and `GET /dashboard` for the current session.
- Logout revokes the refresh token; login revokes prior refresh tokens (one active session per user).
- Frontend stores tokens in `localStorage` and retries failed requests after refresh.

### Authorization

| Role | Capabilities |
|------|--------------|
| `admin` | Delete users; view/manage any user's tasks via `GET /tasks?user_id=` |
| `editor` | Full CRUD on own tasks; list users |
| `viewer` | Read own tasks and list users; no writes |

Permissions are enforced in `permissions.py` (`require_permission`) and mirrored in `frontend/src/permissions.ts` for UI visibility.

### Rate limiting

- **Per user** on authenticated routes (keyed by JWT `sub`).
- **Per IP** on `POST /token` and `POST /users` (brute-force / spam protection).
- `/health` is exempt. Returns `429` when exceeded. Config: `RATE_LIMIT_*` env vars.

### CORS and frontend

- API allows configured origins (`CORS_ORIGINS`).
- Vite dev server proxies `/users`, `/tasks`, `/token`, `/dashboard`, `/auth/github`, etc. to port 8000.

## Where to look in Day 11

| Topic | Location |
|-------|----------|
| JWT, passwords, tokens | `auth.py` |
| RBAC and permissions | `permissions.py` |
| Rate limiting | `rate_limit.py`, `@limiter.limit` in `main.py` |
| Routes and middleware | `main.py` |
| User / task / refresh models | `models.py` |
| Refresh token persistence | `repositories.py`, `alembic/versions/014cfdc7a7a1_add_refreshtoken_table.py` |
| Role column | `alembic/versions/b8e4a1c92d0f_add_role_to_users_table.py` |
| GitHub OAuth | `github_oauth.py`, `github_auth.py` |
| Frontend auth UI | `frontend/src/components/AuthPanel.tsx` |
| Token storage and refresh | `frontend/src/lib/httpClient.ts`, `frontend/src/hooks/useSession.ts` |
| API client | `frontend/src/api.ts` |
| Dev proxy | `frontend/vite.config.ts` |
| Tests | `tests/test_users.py`, `tests/test_refresh_token.py`, `tests/test_permissions.py`, `tests/test_rate_limit.py`, `tests/test_github_oauth.py`, `tests/conftest.py` |

## Quick verify

From `Day 11`:

```bash
source .venv/bin/activate
alembic upgrade head
uvicorn main:app --reload
```

In a second terminal: `cd frontend && npm run dev`

**Auth flow**

1. Register at `POST /users` or via the UI.
2. Login at `POST /token` (`username` = email, `password`).
3. Call `GET /me` with `Authorization: Bearer <access_token>`.
4. Refresh with `POST /token/refresh` and body `{"refresh_token": "..."}`.
5. Log out with `POST /logout`.

**Authorization**

6. As `editor`, create a task; confirm another user cannot access it (403).
7. Promote a user to `admin` in the DB; confirm `GET /tasks?user_id=<other>` works.

**Rate limiting**

8. Set a low limit (e.g. `RATE_LIMIT_DEFAULT=2/minute`), hit `/me` three times, expect `429`.

**Tests**

```bash
python -m pytest
```

## Submission reference

- **Repo path:** `Training/Day 11`
- **Primary docs:** [Day 11/README.md](../Day%2011/README.md)
- **CI:** `.github/workflows/day11-ci.yaml`
