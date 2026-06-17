# Contributing

## Commit Messages

All commits follow the `[TAG] Day N: description` convention.

**Tags:**
- `[IMP]` — improvement or new feature
- `[ADD]` — add a new dependency, config, or file
- `[REF]` — refactor with no behavior change
- `[FIX]` — bug fix
- `[DOC]` — documentation-only change
- `[TEST]` — test-only change

After the colon, write a short description that explains *what* changed. Where non-obvious, include *why* — a one-sentence "so that…" or "because…" suffix. Motivation is the part most likely to be lost.

**Example:**
```
[FIX] Day 15: scope isUpdating to the mutating task row so other buttons stay interactive
[DOC] Day 15: extract WS protocol constants so backend and frontend share the same names
```

**Casing:** Sentence case after the colon (first letter uppercase, rest lowercase unless a proper name).

## Commit-msg Hook

To enforce the convention locally, install the provided hook:

```bash
cp .githooks/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```
