from __future__ import annotations

from typing import Any

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from config import (
    get_log_environment,
    get_log_service,
    get_sentry_dsn,
    get_sentry_traces_sample_rate,
)

SENSITIVE_HEADER_NAMES = frozenset(
    {"authorization", "cookie", "set-cookie", "x-api-key"}
)


def _scrub_sensitive_request_data(event: dict[str, Any], _hint: dict[str, Any]) -> dict[str, Any] | None:
    request = event.get("request")
    if not isinstance(request, dict):
        return event

    headers = request.get("headers")
    if isinstance(headers, dict):
        for name in list(headers):
            if name.lower() in SENSITIVE_HEADER_NAMES:
                headers[name] = "[Filtered]"

    query_string = request.get("query_string")
    if isinstance(query_string, str):
        for param in ("token", "password", "refresh_token", "access_token"):
            if f"{param}=" in query_string.lower():
                request["query_string"] = "[Filtered]"
                break

    return event


def init_sentry() -> bool:
    dsn = get_sentry_dsn()
    if not dsn:
        return False

    sentry_sdk.init(
        dsn=dsn,
        environment=get_log_environment(),
        release=get_log_service(),
        traces_sample_rate=get_sentry_traces_sample_rate(),
        send_default_pii=False,
        before_send=_scrub_sensitive_request_data,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
    )
    return True


def bind_sentry_trace_context(request_id: str, trace_id: str) -> None:
    if not get_sentry_dsn():
        return

    scope = sentry_sdk.get_isolation_scope()
    scope.set_tag("request_id", request_id)
    scope.set_tag("trace_id", trace_id)
