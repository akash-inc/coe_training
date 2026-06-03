from starlette.requests import Request

from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

REQUEST_KEY = "sql_stats_request"


def bind_request_to_session(session: Session, request: Request) -> None:
    session.info[REQUEST_KEY] = request
    request.state.sql_query_count = 0


def get_request_query_count(request: Request) -> int:
    return int(getattr(request.state, "sql_query_count", 0))


class CountingSession(Session):
    def execute(self, statement, *args, **kwargs):
        request = self.info.get(REQUEST_KEY)
        if request is not None:
            request.state.sql_query_count = get_request_query_count(request) + 1
        return super().execute(statement, *args, **kwargs)


def register_engine_listeners(db_engine: Engine) -> None:
    @event.listens_for(db_engine, "before_cursor_execute")
    def _count_raw_sql(
        conn,
        cursor,
        statement,
        parameters,
        context,
        executemany,
    ) -> None:
        if context is not None:
            return
        session = conn.info.get("sql_count_session")
        if session is None:
            return
        request = session.info.get(REQUEST_KEY)
        if request is None:
            return
        request.state.sql_query_count = get_request_query_count(request) + 1

    @event.listens_for(Session, "after_begin")
    def _link_session_to_connection(session, transaction, connection) -> None:
        connection.info["sql_count_session"] = session
