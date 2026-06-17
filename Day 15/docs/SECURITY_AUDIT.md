# Day 15: Security Audit

**Date:** 2026-06-17  
**Scope:** Full-stack Task App (`Day 15/`)  
**Framework:** OWASP-oriented review

---

## Executive Summary

Day 15 follows sound baseline practices for a learning deployment: secrets injected at runtime, no credentials in Docker layers, ORM-based data access, JWT auth on protected routes, and log redaction for tokens. It is **not production-hardened** due to demo single-user auth, in-memory refresh tokens, missing rate limiting, and no CI secret scanning. All findings below are acceptable for the capstone demo if Railway secrets are configured correctly.

---

## Findings by Category

### A01: Broken Access Control

| ID | Finding | Risk | Evidence | Recommendation | Demo OK? |
|----|---------|------|----------|----------------|----------|
| AC-1 | Demo single-user auth | Medium | `main.py` lines 193-198: only `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | Multi-user RBAC for real prod | Yes |
| AC-2 | Comment author check enforced | Low (positive) | `repositories.py` lines 200-201, 210-211 | Keep `PermissionError` to 403 mapping | N/A |
| AC-3 | All task routes require JWT | Low (positive) | `Depends(get_current_user)` on `/tasks/*` | Maintain on new routes | N/A |
| AC-4 | WebSocket auth via query token | Medium | `main.py` line 323: `token: str = Query(...)` | Acceptable with log redaction; consider cookie-based WS in prod | Yes |

---

### A02: Cryptographic Failures

| ID | Finding | Risk | Evidence | Recommendation | Demo OK? |
|----|---------|------|----------|----------------|----------|
| CR-1 | Default JWT secret in dev | High if deployed | `config.py` line 31 | Override `JWT_SECRET` on Railway (`openssl rand -hex 32`) | Yes if overridden |
| CR-2 | HS256 JWT algorithm | Low | `config.py` line 32 | Adequate for demo; RS256 for multi-service prod | Yes |
| CR-3 | Refresh tokens use `secrets.token_urlsafe` | Low (positive) | `auth.py` line 29 | Good entropy | N/A |
| CR-4 | HTTPS/WSS required in prod | Medium | `DEPLOYMENT.md` section 3.1, 3.3 | Verify `https://` and `wss://` in Vite build vars | Must verify |

---

### A03: Injection

| ID | Finding | Risk | Evidence | Recommendation | Demo OK? |
|----|---------|------|----------|----------------|----------|
| IN-1 | SQL injection mitigated via ORM | Low (positive) | `repositories.py` uses SQLAlchemy `select()` | No raw SQL strings | N/A |
| IN-2 | Comment body validated | Low (positive) | `_validate_comment_body()` strip + max 1000 chars | Add task title length validation in Pydantic if missing | Yes |
| IN-3 | Pydantic input on API models | Low (positive) | `models/tasks.py`, `models/comments.py` | Extend validators for title max length | Yes |

---

### A04: Insecure Design

| ID | Finding | Risk | Evidence | Recommendation | Demo OK? |
|----|---------|------|----------|----------------|----------|
| ID-1 | In-memory refresh tokens | Medium | `auth.py` lines 17-18 | PostgreSQL table before multi-instance | Yes |
| ID-2 | No account lockout / rate limit | Medium | No middleware on `/token` | Add rate limiting middleware | Yes for demo |
| ID-3 | Demo credentials in `.env.example` | Low | Documented defaults | Change `DEMO_USER_PASSWORD` on Railway | Yes |

---

### A05: Security Misconfiguration

| ID | Finding | Risk | Evidence | Recommendation | Demo OK? |
|----|---------|------|----------|----------------|----------|
| SM-1 | CORS env-driven | Low (positive) | `config.py` `get_cors_origins()` | Set exact frontend origin, not `*` | Must configure |
| SM-2 | `/ws/echo` unauthenticated | Low | `main.py` lines 223-231 | Remove in production | Yes for demo |
| SM-3 | Sentry/APM optional | Low (positive) | `sentry_config.py`, `elastic_apm_config.py` | Enable in prod for incident response | Optional |

---

### A07: Identification and Authentication Failures

| ID | Finding | Risk | Evidence | Recommendation | Demo OK? |
|----|---------|------|----------|----------------|----------|
| IA-1 | Access token expiry configured | Low (positive) | `ACCESS_TOKEN_EXPIRE_MINUTES` default 30 | Tune per security policy | N/A |
| IA-2 | Refresh token rotation on re-login | Low (positive) | `auth.py` lines 33-35 revokes old tokens per email | Good for single-user demo | N/A |
| IA-3 | Logout revokes refresh token | Low (positive) | `auth.py` `revoke_refresh_token` | Frontend calls on session expiry | N/A |
| IA-4 | JWT in WebSocket URL may leak via Referer | Low | Browser limitation | Short-lived tokens; redact in logs | Yes |

---

### A09: Security Logging and Monitoring Failures

| ID | Finding | Risk | Evidence | Recommendation | Demo OK? |
|----|---------|------|----------|----------------|----------|
| SL-1 | Failed login logged | Low (positive) | `main.py` `auth.login_failed` event | Monitor for brute force | N/A |
| SL-2 | Sensitive headers omitted from logs | Low (positive) | `logging_config.py` `SENSITIVE_HEADER_NAMES` | Maintain on new log fields | N/A |
| SL-3 | Token query params redacted | Low (positive) | `logging_config.py` `SENSITIVE_QUERY_PARAMS` | Includes `token`, `password` | N/A |
| SL-4 | No SIEM/alert wiring by default | Medium | `alerting.py` logs only unless integrated | Configure Sentry alerts per `observability/alert-rules.example.json` | Optional |

---

### Secrets Management Checklist

| Item | Status | Notes |
|------|--------|-------|
| `.env` gitignored | Done | `.gitignore` |
| `.env.example` without real secrets | Done | Placeholder values only |
| Runtime injection via `config.py` | Done | No `os.environ` scattered |
| No secrets in Dockerfile layers | Done | Build args for `VITE_*` are URLs, not secrets |
| Railway env vars for prod | Done | Manual dashboard setup |
| `JWT_SECRET` not default in prod | **Verify** | Must override on Railway |
| Secret scanning in CI (gitleaks) | **Not done** | Add to `.github/workflows/` |
| Central secrets manager | **Not done** | Railway env vars only (Stage 2) |
| Automated rotation | **Not done** | Document manual procedure in RUNBOOK |
| Audit logs for secret access | Limited | Railway dashboard only |

---

### Container and Supply Chain

| Item | Status |
|------|--------|
| Multi-stage Docker builds | Done |
| `requirements.txt` pinned versions | Review periodically |
| No secrets in `docker history` | Verified pattern (runtime env only) |
| CI runs tests before merge | Done (`day15-ci.yaml`) |

---

## Pre-Production Checklist

Before calling a real deployment secure:

- [ ] Run gitleaks on CI; no secrets in git history
- [ ] `JWT_SECRET` and `DEMO_USER_PASSWORD` are strong on Railway
- [ ] `CORS_ORIGINS` is exact frontend HTTPS origin
- [ ] `VITE_API_BASE_URL` and `VITE_API_WS_HOST` use `https://` / `wss://`
- [ ] No true secrets in `VITE_*` variables (URLs are fine)
- [ ] Rate limiting on `/token`
- [ ] Sentry or equivalent error tracking enabled
- [ ] Rotation procedure documented ([RUNBOOK.md](./RUNBOOK.md))

---

## Related Documents

- [CODE_REVIEW.md](./CODE_REVIEW.md)
- [RUNBOOK.md](./RUNBOOK.md)
- [NEXT_STEPS.md](./NEXT_STEPS.md)
