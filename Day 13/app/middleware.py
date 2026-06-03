from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from sql_stats import begin_request_counting, end_request_counting

SQL_QUERY_COUNT_HEADER = "X-Sql-Queries"


class SqlQueryCountMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        begin_request_counting()
        response = await call_next(request)
        query_count = end_request_counting()
        response.headers[SQL_QUERY_COUNT_HEADER] = str(query_count)
        return response
