from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

SQL_QUERY_COUNT_HEADER = "X-Sql-Queries"


class SqlQueryCountMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        query_count = int(getattr(request.state, "sql_query_count", 0))
        response.headers[SQL_QUERY_COUNT_HEADER] = str(query_count)
        return response
