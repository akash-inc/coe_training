import json
import logging
import sys
import time
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any
from urllib.parse import parse_qsl, urlencode

from config import (
    get_log_environment,
    get_log_format,
    get_log_level,
    get_log_service,
    get_slow_request_ms,
)

request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)

STRUCTURED_LOG_FIELDS = (
    "event",
    "service",
    "environment",
    "severity",
    "http_method",
    "path",
    "query_string",
    "status_code",
    "duration_ms",
    "client_ip",
    "user_agent",
    "request_content_length",
    "request_content_type",
    "response_content_length",
    "response_content_type",
    "task_id",
    "user_email",
)

SEVERITY_BY_LEVEL = {
    logging.DEBUG: 7,
    logging.INFO: 6,
    logging.WARNING: 4,
    logging.ERROR: 3,
    logging.CRITICAL: 2,
}

SENSITIVE_QUERY_PARAMS = frozenset(
    {"token", "password", "refresh_token", "access_token", "authorization"}
)

SENSITIVE_HEADER_NAMES = frozenset(
    {"authorization", "cookie", "set-cookie", "x-api-key"}
)


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "severity": SEVERITY_BY_LEVEL.get(record.levelno, 6),
            "service": getattr(record, "service", None) or get_log_service(),
            "environment": getattr(record, "environment", None) or get_log_environment(),
            "logger": record.name,
            "message": record.getMessage(),
        }

        request_id = request_id_ctx.get()
        if request_id:
            payload["request_id"] = request_id

        for field in STRUCTURED_LOG_FIELDS:
            if field in ("service", "environment", "severity"):
                continue
            value = getattr(record, field, None)
            if value is not None:
                payload[field] = value

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


class HumanFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        request_id = request_id_ctx.get()
        prefix = f"[{request_id}] " if request_id else ""
        return super().format(record).replace(record.getMessage(), f"{prefix}{record.getMessage()}", 1)


def setup_logging() -> None:
    level_name = get_log_level()
    level = getattr(logging, level_name, logging.INFO)
    use_json = get_log_format() == "json"

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter() if use_json else HumanFormatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s"
    ))

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)

    for logger_name in ("uvicorn", "uvicorn.error"):
        uvicorn_logger = logging.getLogger(logger_name)
        uvicorn_logger.handlers.clear()
        uvicorn_logger.propagate = True
        uvicorn_logger.setLevel(level)

    access_logger = logging.getLogger("uvicorn.access")
    access_logger.handlers.clear()
    access_logger.propagate = False


def resolve_http_log_level(status_code: int, duration_ms: float) -> int:
    slow_ms = get_slow_request_ms()
    if status_code >= 500:
        return logging.ERROR
    if status_code >= 400:
        return logging.WARNING
    if slow_ms is not None and duration_ms >= slow_ms:
        return logging.WARNING
    return logging.INFO


def _header_value(scope: dict[str, Any], name: bytes) -> str | None:
    for header_name, header_value in scope.get("headers", []):
        if header_name.lower() == name:
            return header_value.decode()
    return None


def _client_ip(scope: dict[str, Any]) -> str | None:
    forwarded_for = _header_value(scope, b"x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    client = scope.get("client")
    if client:
        return client[0]
    return None


def _sanitize_query_string(query_string: bytes) -> str | None:
    if not query_string:
        return None

    sanitized_pairs: list[tuple[str, str]] = []
    for key, value in parse_qsl(query_string.decode(), keep_blank_values=True):
        if key.lower() in SENSITIVE_QUERY_PARAMS:
            sanitized_pairs.append((key, "[REDACTED]"))
        else:
            sanitized_pairs.append((key, value))

    return urlencode(sanitized_pairs)


def _parse_content_length(value: str | None) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def _http_request_extra(
    scope: dict[str, Any],
    *,
    event: str,
    status_code: int | None = None,
    duration_ms: float | None = None,
    response_content_length: int | None = None,
    response_content_type: str | None = None,
) -> dict[str, Any]:
    extra: dict[str, Any] = {
        "event": event,
        "service": get_log_service(),
        "environment": get_log_environment(),
        "http_method": scope.get("method"),
        "path": scope.get("path"),
        "query_string": _sanitize_query_string(scope.get("query_string", b"")),
        "client_ip": _client_ip(scope),
        "user_agent": _header_value(scope, b"user-agent"),
        "request_content_length": _parse_content_length(
            _header_value(scope, b"content-length")
        ),
        "request_content_type": _header_value(scope, b"content-type"),
    }
    if status_code is not None:
        extra["status_code"] = status_code
    if duration_ms is not None:
        extra["duration_ms"] = duration_ms
    if response_content_length is not None:
        extra["response_content_length"] = response_content_length
    if response_content_type is not None:
        extra["response_content_type"] = response_content_type
    return extra


class RequestLoggingMiddleware:
    def __init__(self, app):
        self.app = app
        self.logger = logging.getLogger("day15.http")

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = _header_value(scope, b"x-request-id") or str(uuid.uuid4())
        token = request_id_ctx.set(request_id)
        start = time.perf_counter()
        status_code = 500
        response_content_length: int | None = None
        response_content_type: str | None = None

        if self.logger.isEnabledFor(logging.DEBUG):
            self.logger.debug(
                "request received",
                extra=_http_request_extra(scope, event="http.request.received"),
            )

        async def send_wrapper(message):
            nonlocal status_code, response_content_length, response_content_type
            if message["type"] == "http.response.start":
                status_code = message["status"]
                headers = {
                    name.decode().lower(): value.decode()
                    for name, value in message.get("headers", [])
                }
                response_content_length = _parse_content_length(headers.get("content-length"))
                response_content_type = headers.get("content-type")
                outgoing_headers = list(message.get("headers", []))
                outgoing_headers.append((b"x-request-id", request_id.encode()))
                message = {**message, "headers": outgoing_headers}
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            log_level = resolve_http_log_level(status_code, duration_ms)
            self.logger.log(
                log_level,
                "request completed",
                extra=_http_request_extra(
                    scope,
                    event="http.response",
                    status_code=status_code,
                    duration_ms=duration_ms,
                    response_content_length=response_content_length,
                    response_content_type=response_content_type,
                ),
            )
        except Exception:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            self.logger.exception(
                "request failed",
                extra=_http_request_extra(
                    scope,
                    event="http.response",
                    status_code=status_code,
                    duration_ms=duration_ms,
                    response_content_length=response_content_length,
                    response_content_type=response_content_type,
                ),
            )
            raise
        finally:
            request_id_ctx.reset(token)
