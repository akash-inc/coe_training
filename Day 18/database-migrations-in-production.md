# Database Migrations in Production (Alembic)

Notes on running Alembic migrations safely in production vs local development, with a FastAPI + SQLAlchemy stack.

Related: [Day 15](../Day%2015/) runs `alembic upgrade head` in `docker-entrypoint.sh` before uvicorn starts on Railway.

## The core tension

**Production** demands safety, auditability, and zero data loss.

**Local dev** demands speed, flexibility, and low friction.

Alembic supports both, but the workflows diverge. The migration file that reaches production should look nothing like the first draft that `--autogenerate` produced.

## Local dev strategy

### Autogenerate + liberal resets

The standard local flow leans on autogeneration:

```bash
# After changing SQLAlchemy models:
alembic revision --autogenerate -m "add user profile fields"
alembic upgrade head
```

Autogenerate diffs your SQLAlchemy metadata against the live database and writes a migration. In dev this is fine because:

- You own the database, so data loss is acceptable.
- You can replay the whole chain with `downgrade base` then `upgrade head`.
- You can drop and recreate the database entirely.

**Nuclear reset** (common in dev):

```bash
alembic downgrade base
alembic upgrade head
```

Or:

```bash
psql -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
alembic upgrade head
```

Day 15 tests use a lighter version: `TRUNCATE ... RESTART IDENTITY` plus re-seed, then Alembic upgrade in session scope.

### Squashing migrations before merge

Feature branches accumulate small migrations (`add_column_x`, `fix_column_x`, `rename_column_x`). Before merging to `main`, squash them into one clean revision:

```bash
# Remove intermediate revision files, then:
alembic revision -m "add user profile fields"
# Hand-write upgrade()/downgrade() for the final desired state
```

This keeps history readable before it ever reaches production.

### Dev-friendly `env.py`

Local `env.py` often reads `DATABASE_URL` from `.env` with no extra ceremony:

```python
from config import get_database_url

config.set_main_option("sqlalchemy.url", get_database_url())
```

Day 15's `config.py` also normalizes Railway URLs (`postgres://` to `postgresql+psycopg://`), which is useful in both dev and deploy.

## Production migration strategy

### Never ship autogenerate output blindly

Autogenerate is a **starting point**, not a final product. Before production, every migration must be:

1. **Reviewed by a human** — autogenerate misses renames (it emits drop + add), partial indexes, triggers, check constraints, and custom SQL.
2. **Tested on a production-like database** — same Postgres version, realistic data volume.
3. **Checked for locking** — `ADD COLUMN` is usually safe on Postgres; `ADD COLUMN NOT NULL DEFAULT` on a large table can lock for minutes on older versions.

### Linear migration history

Production Alembic history **must be linear**. No branches, no gaps.

```
a1b2c3d4 → e5f6g7h8 → i9j0k1l2   ✅ deployable
a1b2c3d4 → e5f6g7h8
           ↘ i9j0k1l2              ❌ branched — upgrade head fails
```

When two developers create migrations from the same parent revision:

```bash
alembic merge heads -m "merge dev branches"
```

CI should fail if `alembic heads` returns more than one head.

### Only `upgrade` in production, never `downgrade`

Downgrades are a trap in production:

- `downgrade()` is the least-tested code path.
- Dropped columns cannot be restored if new data was written after the migration.
- Failed deploy rollback happens at the **application level** (previous container image), not by reversing schema.
- `alembic_version` still records the migration; Alembic will not re-run it on the next `upgrade head`.

**Correct prod rollback**: keep schema forward-compatible (expand/contract), roll back app code, write a **new forward migration** if the schema must change again.

This pairs with blue/green deployment: switch traffic back to blue (old app) while the database still supports both versions during the expand phase.

### Expand/contract pattern (zero-downtime)

For destructive schema changes, split across **multiple deploys** so old and new app versions can run against the same database.

**Example: rename `users.name` to `users.full_name`**

**Phase 1 — Expand** (migration + deploy):

```python
def upgrade():
    op.add_column("users", sa.Column("full_name", sa.String()))
    op.execute("UPDATE users SET full_name = name")
    op.alter_column("users", "full_name", nullable=False)
```

Application reads/writes **both** columns (or writes both, reads prefer new).

**Phase 2 — Contract** (migration + deploy, days or weeks later):

```python
def upgrade():
    op.drop_column("users", "name")
```

Application uses only `full_name`.

Each phase is independently deployable and rollback-safe at the app layer.

Other expand/contract examples:

| Change | Expand | Contract |
|--------|--------|----------|
| Rename column | Add new column, backfill, dual-write | Drop old column |
| Split table | Add new table, backfill, dual-read | Remove old columns |
| Change type | Add new column with new type, backfill | Drop old column |
| Remove column | Stop writing in app first | Drop column in migration |

### Locking-aware migrations

High-traffic tables need migrations that avoid long table locks.

**Adding a NOT NULL column safely:**

```python
def upgrade():
    op.add_column("orders", sa.Column("processed", sa.Boolean(), nullable=True))
    op.execute("UPDATE orders SET processed = false")
    op.alter_column(
        "orders",
        "processed",
        nullable=False,
        server_default=sa.text("false"),
    )
```

**Indexes on large tables** — use `CONCURRENTLY` in Postgres:

```python
def upgrade():
    op.execute(
        "CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id)"
    )

def downgrade():
    op.execute("DROP INDEX CONCURRENTLY idx_orders_user_id")
```

`CONCURRENTLY` cannot run inside a transaction. Options:

- End the implicit transaction before the statement (`COMMIT` via raw SQL), or
- Set `transaction_per_migration = True` in `env.py` and structure migrations accordingly.

### Production `env.py` patterns

Production `env.py` should:

- Load credentials from env or a secrets manager (not hardcoded).
- Use `compare_type=True` to detect column type drift.
- Consider `transaction_per_migration=True` for safer partial failure handling.

```python
with connectable.connect() as connection:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        transaction_per_migration=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()
```

Day 15 today uses a simpler `env.py` (appropriate for learning). Tighten these flags before high-traffic production.

### Migrations in CI/CD

Production migrations should not rely on a developer running Alembic by hand.

**Run on deploy** (Day 15 pattern):

```sh
# docker-entrypoint.sh
alembic upgrade head
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
```

**Gate in CI** (extend Day 15 pipeline):

```yaml
- name: Run migrations against test DB
  run: alembic upgrade head
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

- name: Check models match migrations
  run: alembic check
```

`alembic check` (Alembic 1.9+) compares models to the database and fails if they diverge. It catches "model changed but no migration generated."

**Order of operations on deploy:**

1. Run `alembic upgrade head` (schema ready for new code).
2. Start new application version (or switch traffic in blue/green).

For expand/contract, the migration and app deploy must ship together per phase.

## Migrations + blue/green together

| Phase | Database | App (blue) | App (green) |
|-------|----------|------------|-------------|
| Expand deploy | Add new column (nullable) | Old code (ignores column) | New code (reads/writes new column) |
| Traffic switch | Same DB | Idle | Live |
| Contract deploy | Drop old column | N/A | New code only |

Rule: **the database must support both app versions** during the window when either environment might serve traffic.

## Side-by-side summary

| Concern | Local dev | Production |
|---------|-----------|------------|
| Generating migrations | `--autogenerate` freely | Autogenerate + human review |
| Squashing | Encouraged before merge | Forbidden after merge to main |
| Downgrade | Used freely | Never run |
| Destructive changes | Drop directly | Expand/contract across deploys |
| Index creation | `CREATE INDEX` | `CREATE INDEX CONCURRENTLY` |
| DB credentials | `.env` file | Env vars / secrets manager |
| Running migrations | Developer manually | CI/CD or entrypoint on deploy |
| Schema reset | `DROP SCHEMA` + `upgrade head` | Forbidden |
| Branch history | Often messy | Must be linear; `alembic heads` = 1 |
| Locking | Usually ignored | Central concern |
| Rollback | Replay migrations or reset DB | Roll back app; forward-fix schema |

## Mental model

- **Local dev** optimizes iteration speed.
- **Production** optimizes correctness and reversibility at every step.
- **Alembic `upgrade`** applies schema changes; **app rollback** handles bad releases.
- **Expand/contract** is how you change schema without downtime.
- **Blue/green** switches traffic; migrations must keep the database compatible with both sides during the switch.

## Further reading

- [Alembic autogenerate](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)
- [Alembic batch operations (SQLite / limited DDL)](https://alembic.sqlalchemy.org/en/latest/batch.html)
- [Expand and contract (Martin Fowler)](https://martinfowler.com/bliki/ParallelChange.html)
- Day 15: `alembic/`, `docker-entrypoint.sh`, `DEPLOYMENT.md`
