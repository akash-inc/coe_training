import re
import uuid
from contextlib import contextmanager
from contextvars import ContextVar
from typing import Any, Iterator

REQUEST_ID_HEADER = "x-request-id"
TRACE_ID_HEADER = "x-trace-id"

_ID_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")

request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)
trace_id_ctx: ContextVar[str | None] = ContextVar("trace_id", default=None)


def normalize_trace_id(value: str | None, *, generate: bool = True) -> str | None:
    if value is None:
        return str(uuid.uuid4()) if generate else None

    candidate = value.strip()
    if not candidate or not _ID_PATTERN.fullmatch(candidate):
        return str(uuid.uuid4()) if generate else None
    return candidate


def resolve_request_id(value: str | None) -> str:
    return normalize_trace_id(value, generate=True)  # type: ignore[return-value]


def resolve_trace_id(value: str | None, *, fallback: str | None = None) -> str:
    resolved = normalize_trace_id(value, generate=False)
    if resolved is not None:
        return resolved
    if fallback is not None:
        return fallback
    return str(uuid.uuid4())


def get_request_id() -> str | None:
    return request_id_ctx.get()


def get_trace_id() -> str | None:
    return trace_id_ctx.get()


def header_value(scope: dict[str, Any], name: str) -> str | None:
    target = name.lower().encode()
    for header_name, header_value in scope.get("headers", []):
        if header_name.lower() == target:
            return header_value.decode()
    return None


def resolve_http_trace_context(scope: dict[str, Any]) -> tuple[str, str]:
    request_id = resolve_request_id(header_value(scope, REQUEST_ID_HEADER))
    trace_id = resolve_trace_id(
        header_value(scope, TRACE_ID_HEADER),
        fallback=request_id,
    )
    return request_id, trace_id


@contextmanager
def bind_trace_context(request_id: str, trace_id: str) -> Iterator[None]:
    request_token = request_id_ctx.set(request_id)
    trace_token = trace_id_ctx.set(trace_id)
    try:
        from sentry_config import bind_sentry_trace_context

        bind_sentry_trace_context(request_id, trace_id)
        yield
    finally:
        request_id_ctx.reset(request_token)
        trace_id_ctx.reset(trace_token)


def trace_response_headers(request_id: str, trace_id: str) -> list[tuple[bytes, bytes]]:
    return [
        (REQUEST_ID_HEADER.encode(), request_id.encode()),
        (TRACE_ID_HEADER.encode(), trace_id.encode()),
    ]


def merge_response_headers(
    headers: list[tuple[bytes, bytes]],
    request_id: str,
    trace_id: str,
) -> list[tuple[bytes, bytes]]:
    merged = list(headers)
    existing = {name.lower() for name, _ in merged}
    for name, value in trace_response_headers(request_id, trace_id):
        if name not in existing:
            merged.append((name, value))
    return merged
