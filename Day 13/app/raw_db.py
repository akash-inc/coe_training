import psycopg
from sqlalchemy.engine import make_url

from database import DATABASE_URL
from queries import ENROLLMENT_COUNT_BY_COURSE_SQL


def _connect_kwargs() -> dict[str, str | int]:
    url = make_url(DATABASE_URL)
    return {
        "host": url.host or "localhost",
        "port": url.port or 5432,
        "user": url.username or "",
        "password": url.password or "",
        "dbname": url.database or "",
    }


def fetch_enrollment_counts_raw() -> list[dict]:
    with psycopg.connect(**_connect_kwargs()) as conn:
        with conn.cursor() as cursor:
            cursor.execute(ENROLLMENT_COUNT_BY_COURSE_SQL)
            columns = [desc.name for desc in cursor.description]
            return [dict(zip(columns, row, strict=True)) for row in cursor.fetchall()]
