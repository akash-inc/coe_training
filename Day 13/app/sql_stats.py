from contextvars import ContextVar

from sqlalchemy import event
from sqlalchemy.engine import Engine

_sql_query_count: ContextVar[int] = ContextVar("sql_query_count", default=0)
_counting_active: ContextVar[bool] = ContextVar("sql_counting_active", default=False)


def begin_request_counting() -> None:
    _sql_query_count.set(0)
    _counting_active.set(True)


def end_request_counting() -> int:
    _counting_active.set(False)
    return _sql_query_count.get()


def _increment_sql_query_count() -> None:
    if _counting_active.get():
        _sql_query_count.set(_sql_query_count.get() + 1)


def register_engine_listeners(db_engine: Engine) -> None:
    @event.listens_for(db_engine, "before_cursor_execute")
    def _count_cursor_execute(
        conn,
        cursor,
        statement,
        parameters,
        context,
        executemany,
    ) -> None:
        _increment_sql_query_count()
