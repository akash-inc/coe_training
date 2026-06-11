#!/bin/sh
set -e

alembic upgrade head

if [ "$#" -eq 0 ]; then
  exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
fi

exec "$@"
