# Day 14: API Security, Authentication & Authorization

Topics for Day 14. The implementation lives in the **Day 11** repo (`Training/Day 11`).

## What was covered

- **JWT authentication in FastAPI**: Token-based auth so the API can identify who is logged in (`auth.py`, `OAuth2PasswordBearer`, `get_current_user`).
- **Password hashing with bcrypt**: Passwords are hashed on registration and verified on login; stored in `users.password_hash`.
- **Token generation and validation**: Login returns a JWT; protected routes decode and validate it on every request.
- **Protect API routes with authentication**: `/me`, `/dashboard`, `/users`, and `/tasks` require a valid Bearer token; missing or invalid tokens return 401.
- **Permission-based authorization**: Users can only view and manage their own tasks; accessing another user's task returns 403.
- **OAuth2 with password and bearer flows**: Login uses email and password; subsequent requests send `Authorization: Bearer <token>`.
- **Implement OAuth2 flow in FastAPI**: `POST /token` accepts `OAuth2PasswordRequestForm` and returns an access token.
- **CORS configuration for production**: `CORSMiddleware` allows configured frontend origins.
- **Configure CORS for React frontend**: Vite dev server proxies API routes and CORS is set for `localhost:5173`.

## Where to look in Day 11

| Topic | Location |
|-------|----------|
| Auth helpers | `auth.py` |
| Routes & protection | `main.py` |
| Password column | `models.py`, `alembic/versions/6e833c65ab0a_add_password_hash_to_users_table.py` |
| Frontend auth UI | `frontend/src/App.tsx`, `frontend/src/api.ts` |
| Protected dashboard | `GET /dashboard`, `frontend/src/components/Dashboard.tsx` |
| Tests | `tests/test_dashboard.py`, `tests/conftest.py` |

## Quick verify

From `Day 11`:

```bash
source .venv/bin/activate
alembic upgrade head
uvicorn main:app --reload
```

1. Register at `POST /users` (or via the UI).
2. Login at `POST /token` with `username` (email) and `password`.
3. Call `GET /me` or `GET /dashboard` with `Authorization: Bearer <token>`.
4. Open `http://127.0.0.1:5173/dashboard` after logging in through the React app.
