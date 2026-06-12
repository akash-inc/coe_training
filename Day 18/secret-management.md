# Secrets Management

Ground-level notes on what actually works at different scales, which tools fit which situations, and the mistakes that keep showing up in post-mortems.

The most common way a production system gets compromised is not a sophisticated exploit. It is a developer pushing a `.env` file to a public GitHub repo, a Docker image built with secrets baked into a layer, or a Kubernetes secret stored in plaintext YAML that ended up in version control.

Secrets management feels solved right up until it is not. This doc covers the threat model, a maturity progression most teams follow, patterns that prevent incidents, tool choices, and how Day 15 fits in today.

## What you are actually protecting against

The threat model for secrets is rarely "hackers brute-forcing your password." The real risks are:

| Risk | What happens |
|------|----------------|
| **Secrets in version control** | Git history is forever. Even after deletion, commits remain in forks and clones. |
| **Secrets in container images** | Docker layers are often inspectable. `docker history` or a pulled image can expose baked-in values. |
| **Secrets in process lists** | On some systems, `ps aux` or `/proc` can expose environment variables to other processes on the host. |
| **Secrets in logs** | Middleware that logs headers, query strings, or full request bodies can persist tokens and connection strings. |
| **Overly broad access** | One compromised service with access to every secret becomes a full breach. |

## The spectrum: bad to acceptable

### Stage 1: `.env` files (local dev only)

```bash
# .env (never committed)
JWT_SECRET=local-dev-only
DATABASE_URL=postgresql+psycopg://akash:password@localhost/day15_tasks
```

**Fine for**: local development on your machine.

**Fragile because**:

- Secrets get shared over Slack, email, or shared password managers without rotation.
- Easy to accidentally commit (or commit once and forget it lives in history).
- No audit trail of who read or changed a value.
- Rotating a secret means hunting every developer laptop.

Day 15 uses this pattern locally via `config.py` + `load_dotenv()`, with `.env` gitignored and `.env.example` documenting keys without real values.

### Stage 2: CI/CD and platform environment variables

Examples: GitHub Actions secrets, GitLab CI variables, Railway service variables.

**Better than**: committing `.env` to the repo.

**Still limited**:

- No centralized rotation (change in three places: Railway backend, Railway frontend build, GitHub Actions).
- Weak or no audit trail on who accessed what.
- Per-environment granularity is manual (separate variables per service).
- Easy to copy-paste production URLs with wrong scheme (`http://` vs `https://`) or leak values in build logs.

Day 15 on Railway today sits here: `JWT_SECRET`, `DATABASE_URL`, and `VITE_*` vars live in the Railway dashboard.

### Stage 3: Dedicated secrets manager (production target)

A central store with encryption at rest, access control, audit logs, and often automated rotation.

**Examples**:

| Tool | Best for |
|------|----------|
| **HashiCorp Vault** | Self-hosted, fine-grained policies, dynamic secrets (short-lived DB creds) |
| **AWS Secrets Manager** | AWS-native apps, IAM integration, automatic rotation hooks |
| **GCP Secret Manager** | GCP workloads |
| **Azure Key Vault** | Azure workloads |
| **Doppler** | Managed simplicity, good DX for small/medium teams |
| **Infisical** | Open-source, self-hosted or cloud, developer-friendly |

Production should aim for Stage 3. Stage 1 and 2 remain valid for dev and CI with clear boundaries.

## Patterns that prevent incidents

### Never bake secrets into container images

The **build** should not need production credentials. Secrets are injected at **runtime** via environment variables or mounted files.

**Bad** (Dockerfile):

```dockerfile
ENV JWT_SECRET=super-secret-key   # ❌ visible in image layers
```

**Good** (Day 15):

```dockerfile
# Dockerfile has no secrets
# Railway / runtime injects JWT_SECRET when the container starts
```

Verify after build:

```bash
docker history <image-name>
docker inspect <image-name>
```

If a secret ever appeared in a `ENV` or `ARG` during build, assume it is compromised and rotate it.

### Inject at runtime, read from config

Day 15's `config.py` reads from the environment at process start:

```python
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
DATABASE_URL = normalize_database_url(os.getenv("DATABASE_URL", ...))
```

The default `"your-secret-key"` is acceptable for local dev only. Production must override it via Railway or a secrets manager. Never rely on the default in prod.

### Separate build-time vs runtime secrets

| Type | When needed | Day 15 example |
|------|-------------|----------------|
| **Build-time** | Compiled into frontend bundle | `VITE_API_BASE_URL` (public URL, not a secret) |
| **Runtime** | Server only, never in client | `JWT_SECRET`, `DATABASE_URL`, `DEMO_USER_PASSWORD` |

Never put true secrets in `VITE_*` variables. They end up in the browser bundle.

### Rotate regularly, automate where possible

Any secret not rotated in over a year is probably stale in multiple places.

| Secret | Suggested cadence |
|--------|-------------------|
| Database passwords | Quarterly (or use dynamic creds from Vault) |
| JWT signing keys | On compromise, or scheduled with session invalidation plan |
| Third-party API keys | Per vendor policy; immediately on leak |
| Demo/login passwords | Before any public demo or pen test |

A secrets manager makes rotation a single update that all services pull on next deploy or refresh. Without one, rotation means searching every repo, `.env`, Railway service, and CI variable.

### Audit access logs

Every major secrets manager logs **who** (or which service identity) accessed **which secret** and **when**.

Watch for:

- A service reading credentials it never needed before
- Human access outside business hours
- Spike in failed authentication to the secrets API

### Least privilege per service

A background email worker should not have the database master password.

Name secrets by scope:

```
prod/emailworker/sendgrid-api-key     ✅
prod/sendgrid                         ❌ too broad
```

On Railway, use separate services with only the variables each service needs. Backend gets `JWT_SECRET` and `DATABASE_URL`; frontend build gets only `VITE_*` public URLs.

### Scan for secrets in CI

Tools like **gitleaks** or **trufflehog** scan commits for API keys, connection strings, and private keys.

```yaml
# .github/workflows/security.yml
- name: Scan for secrets
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Run as a required CI check on every PR. Finding a committed secret **before merge** is dramatically cheaper than rotating after it hits a public repo.

If a secret is committed:

1. Rotate the secret immediately (the old value is compromised).
2. Remove from the latest commit if possible.
3. Rewrite history or use provider tools only if you understand the blast radius.
4. Assume anything in a public repo was scraped within minutes.

## How secrets flow in a typical deploy

```
Developer machine          CI (GitHub Actions)        Production (Railway)
─────────────────         ─────────────────────       ────────────────────
.env (local only)    →    secrets.* in workflow   →   Service variables
     │                         │                          │
     │                         │                          ▼
     └─ never pushed ──────────┴──────────────→    Container runtime env
                                                      │
                                                      ▼
                                                 config.py reads os.environ
```

Future state with a secrets manager:

```
Vault / Doppler / AWS SM
        │
        ├──► CI (short-lived token for tests)
        ├──► Railway backend (JWT, DB URL at runtime)
        └──► No secrets in git, images, or build logs
```

## Kubernetes note (if you scale there)

Kubernetes `Secret` objects are **base64-encoded, not encrypted**. Anyone with `kubectl get secret -o yaml` access can decode them. They must never be committed to git.

Better patterns:

- External Secrets Operator (syncs from Vault / AWS SM into K8s)
- Sealed Secrets (encrypted in git, decrypted only in cluster)
- Workload identity so pods fetch secrets directly without static files in the cluster

## Day 15: current state and gaps

| Item | Status |
|------|--------|
| `.env` gitignored | Done |
| `.env.example` without real secrets | Done |
| Runtime injection via `config.py` | Done |
| No secrets in Dockerfile layers | Done |
| Railway env vars for prod | Done |
| `JWT_SECRET` not hardcoded in prod | Must verify on Railway (override default) |
| Secret scanning in CI | Not yet (gitleaks) |
| Central secrets manager | Not yet |
| Automated rotation | Not yet |
| Audit logs for secret access | Limited (Railway dashboard only) |

`DEMO_USER_PASSWORD` in env is fine for learning; replace or remove before a real production launch.

## Choosing a tool (2026 starting point)

Move up complexity only when the simpler tool creates visible problems.

| Situation | Suggestion |
|-----------|------------|
| Solo / learning project | Platform env vars (Railway) + `.env` locally + gitleaks in CI |
| Small team, want managed | **Doppler** (simple UX, syncs to many platforms) |
| Want open-source / self-hosted | **Infisical** |
| AWS-native production | **AWS Secrets Manager** + IAM roles |
| Enterprise, dynamic DB creds | **HashiCorp Vault** |

The investment in a proper secrets manager pays off the first time you rotate a compromised credential under pressure. Rotation that takes five minutes because everything pulls from one place is a different experience from hunting through ten repos and four deployment pipelines for every hardcoded key.

## Checklist before calling production "secure"

- [ ] No `.env` or real secrets in git (run gitleaks on CI)
- [ ] `docker history` shows no secret values in image layers
- [ ] `JWT_SECRET` and DB passwords are strong and not defaults
- [ ] Frontend has no true secrets in `VITE_*` vars
- [ ] Each service has only the secrets it needs
- [ ] Rotation procedure documented (even if manual at first)
- [ ] Logs do not print `Authorization` headers or connection strings
- [ ] CORS and HTTPS configured (secrets in transit protected by TLS)

## Key takeaway

Secrets management is not a one-time setup. It is a set of habits: **never commit**, **never bake into images**, **inject at runtime**, **rotate under pressure**, **scan in CI**, and **narrow access** per service. Start with what fits your stack today (Day 15: Railway + `.env.example` + `config.py`), then add gitleaks and a secrets manager when the cost of manual rotation and scattered copies becomes real.

## Further reading

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [gitleaks](https://github.com/gitleaks/gitleaks)
- [HashiCorp Vault](https://developer.hashicorp.com/vault)
- Day 15: `config.py`, `.env.example`, `DEPLOYMENT.md`
