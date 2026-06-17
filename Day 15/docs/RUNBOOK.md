# Day 15: Deployment Runbook

Operator checklist for deploying and operating the Full-Stack Task App. For the narrative history and pitfalls, see [DEPLOYMENT.md](../DEPLOYMENT.md).

---

## Prerequisites

- [ ] Railway account with project access
- [ ] GitHub repo connected (or manual deploy from `Day 15/` paths)
- [ ] Strong secrets generated locally:
  ```bash
  openssl rand -hex 32   # JWT_SECRET
  ```
- [ ] Note: app root directory is `Day 15` (contains a space)

---

## Service Layout (Railway)

| # | Service | Root directory | Dockerfile |
|---|---------|----------------|------------|
| 1 | PostgreSQL | Plugin | N/A |
| 2 | Backend API | `Day 15` | `Day 15/Dockerfile` |
| 3 | Frontend | `Day 15/frontend` | `Day 15/frontend/Dockerfile` (production stage) |

---

## Deploy Procedure

### Step 1: PostgreSQL

1. Add PostgreSQL plugin to Railway project
2. Note the auto-generated `DATABASE_URL` reference for backend

### Step 2: Backend

1. Create service from repo, root directory: `Day 15`
2. Set variables:

   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<openssl rand -hex 32>
   DEMO_USER_EMAIL=test@example.com
   DEMO_USER_PASSWORD=<strong-password>
   CORS_ORIGINS=https://<frontend-domain>.up.railway.app
   LOG_LEVEL=INFO
   LOG_FORMAT=json
   LOG_ENVIRONMENT=production
   ```

3. Deploy and generate public domain
4. Verify: `curl https://<backend-domain>/` returns `{"message":"Hello, World!"}`

### Step 3: Frontend

1. Create service, root directory: `Day 15/frontend`
2. Set **build-time** variables (trigger rebuild after changes):

   ```
   VITE_API_BASE_URL=https://<backend-domain>.up.railway.app
   VITE_API_WS_HOST=wss://<backend-domain>.up.railway.app
   ```

3. Deploy and generate public domain
4. Hard refresh browser after deploy (Vite vars are baked into bundle)

### Step 4: CORS

1. Set backend `CORS_ORIGINS` to exact frontend HTTPS URL (no trailing slash mismatch)
2. Redeploy backend if CORS was placeholder during step 2

### Step 5: Optional observability

| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` | Error tracking |
| `SENTRY_TRACES_SAMPLE_RATE` | Performance traces (0.0 to 1.0) |
| `ELASTIC_APM_SERVER_URL` | APM server |
| `ELASTIC_APM_SECRET_TOKEN` | APM auth |

---

## Post-Deploy Verification

| # | Check | Command / action |
|---|-------|----------------|
| 1 | API greeting | `curl https://<backend>/` |
| 2 | Liveness | `curl https://<backend>/live` |
| 3 | Readiness | `curl https://<backend>/ready` |
| 4 | Login | UI login with `DEMO_USER_*` credentials |
| 5 | Task CRUD | Create, edit, complete, delete a task |
| 6 | Persistence | Restart backend service; tasks remain |
| 7 | WebSocket | Open same task in two tabs; comment syncs live |
| 8 | Logs | Railway logs show JSON with `event` and `request_id` |
| 9 | HTTPS | No mixed-content errors in browser console |

---

## Rollback

### Application rollback (no schema change)

1. Railway → backend service → Deployments → redeploy previous successful deployment
2. Railway → frontend service → redeploy previous deployment
3. Re-run verification checklist (items 1-7)

**Note:** In-memory refresh tokens are cleared on backend restart. Users must log in again after rollback.

### Database migration rollback

**Caution:** `docker-entrypoint.sh` runs `alembic upgrade head` on every deploy. Rolling back application code without matching migration state can fail startup.

- For this app (single initial migration), rollback is usually code-only
- Before adding new migrations: test `alembic downgrade -1` in staging
- See [DEPLOYMENT.md](../DEPLOYMENT.md) section 3.8 for migration-on-deploy context

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Mixed content blocked | `VITE_API_BASE_URL` uses `http://` | Set `https://`, rebuild frontend |
| WebSocket fails on HTTPS | `VITE_API_WS_HOST` uses `ws://` | Set `wss://`, rebuild frontend |
| CORS error | `CORS_ORIGINS` wrong or missing | Exact frontend origin on backend |
| 503 on `/ready` | DB unreachable | Check `DATABASE_URL`, Postgres plugin |
| Login 401 | Wrong `DEMO_USER_*` | Match Railway backend vars |
| Empty tasks after deploy | Migrations failed | Check deploy logs for `alembic upgrade` |
| Users logged out after deploy | In-memory refresh tokens | Expected; document to users |
| Frontend shows old API URL | Cached bundle | Hard refresh; confirm rebuild ran |
| Build fails on path | Space in `Day 15` | Set root directory in Railway UI |

---

## Incident Response

### 1. Triage

- Check `/live` and `/ready` on backend domain
- Check Railway status page and service metrics

### 2. Logs

- Railway → backend → Logs
- Filter JSON: `"event":"http.response"` and `"status_code":>=500`
- Correlate user report: ask for approximate time, filter by `trace_id` if available from browser Network tab (`X-Trace-ID`)

### 3. Errors

- If `SENTRY_DSN` configured: check Sentry for stack traces
- If Elastic APM configured: check slow transactions

### 4. Communicate

- Demo app: note expected downtime during redeploy
- Production: status page or team channel per your process

### 5. Recovery

- Rollback to last green deployment (see above)
- If DB issue: check Postgres plugin, connection limits, disk

---

## Secret Rotation (manual)

| Secret | Steps |
|--------|-------|
| `JWT_SECRET` | Generate new value → update Railway → redeploy backend → **all users must re-login** |
| `DEMO_USER_PASSWORD` | Update Railway → redeploy → share new creds with team |
| `DATABASE_URL` | Railway Postgres rotate → update backend var → redeploy |

Document rotation date and who performed it in your team wiki.

---

## Local Operations (reference)

```bash
cd "Day 15"
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| Postgres | localhost:5432 |

---

## Related Documents

- [DEPLOYMENT.md](../DEPLOYMENT.md) (pitfalls narrative)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- [PERFORMANCE.md](./PERFORMANCE.md)
