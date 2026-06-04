# Student lookup — index vs sequential scan

Compare PostgreSQL plans for a **indexed** column (`email`, unique) vs an **unindexed** column (`phone`). Run after seeding enough rows that a sequential scan is visible.

Seed first:

```bash
curl -X POST http://127.0.0.1:8000/populate-all-bulk \
  -H "Content-Type: application/json" \
  -d @large-seed.json
```

Or use **Seed large (bulk)** in the Query lab UI.

Connect:

```bash
psql -U akash -d school
```

---

## 1. Indexed lookup — `email`

`students.email` has a **unique** constraint (see `app/models.py`), so PostgreSQL can use an index.

Pick an email from your seed, e.g. `student1@lab.example`:

```sql
EXPLAIN ANALYZE
SELECT * FROM students WHERE email = 'student1@lab.example';
```

**Expect:** `Index Scan` or `Index Only Scan` on the unique index for `email`.  
**Cost:** roughly O(log n) index seek, not a full table read.

---

## 2. Unindexed lookup — `phone`

`students.phone` has **no** index in the default schema.

```sql
EXPLAIN ANALYZE
SELECT * FROM students WHERE phone = '+14155553000';
```

**Expect:** `Seq Scan on students` — PostgreSQL reads every row until it finds a match (or exhausts the table).

On a small table the difference may look minor; after **Seed large (bulk)** (40 students) the pattern is the same, and at thousands of rows the gap grows quickly.

---

## 3. Optional exercise — add an index on `phone`

```sql
CREATE INDEX ix_students_phone ON students (phone);
```

Re-run the phone query:

```sql
EXPLAIN ANALYZE
SELECT * FROM students WHERE phone = '+14155553000';
```

**Expect:** plan switches to **Index Scan** on `ix_students_phone`.

To revert for experimentation:

```sql
DROP INDEX IF EXISTS ix_students_phone;
```

---

## Side-by-side summary

| Query | Column | Index | Typical plan |
|-------|--------|-------|--------------|
| `WHERE email = ?` | `email` | Unique (built-in) | Index Scan |
| `WHERE phone = ?` | `phone` | None (default) | Seq Scan |
| `WHERE phone = ?` after `CREATE INDEX` | `phone` | `ix_students_phone` | Index Scan |

---

## When to add indexes

- Columns in **`WHERE`**, **`JOIN`**, and **`ORDER BY`** that appear in hot queries.
- Foreign keys used in joins (this project indexes `enrollments.student_id` and `course_id`).
- Avoid indexing every column — writes slow down and storage grows.

See also [course-enrollment-counts-slow-explain.md](course-enrollment-counts-slow-explain.md) for query-shape optimization (different lesson: better SQL vs better indexes).
