from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

SQL_QUERY_COUNT_HEADER = "X-Sql-Queries"
POOL_MODE_HEADER = "X-Db-Pool-Mode"

EXPOSED_HEADERS = [
    SQL_QUERY_COUNT_HEADER,
    POOL_MODE_HEADER,
    "X-Pool-Checked-Out",
    "X-Pool-Size",
]


class SqlQueryCountMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        query_count = int(getattr(request.state, "sql_query_count", 0))
        response.headers[SQL_QUERY_COUNT_HEADER] = str(query_count)

        pool_mode = getattr(request.state, "db_pool_mode", None)
        if pool_mode:
            response.headers[POOL_MODE_HEADER] = pool_mode
        if pool_mode == "pooled":
            from database import get_pool_status

            pool = get_pool_status()
            response.headers["X-Pool-Checked-Out"] = str(pool["checked_out"])
            response.headers["X-Pool-Size"] = str(pool["pool_size"])

        return response
