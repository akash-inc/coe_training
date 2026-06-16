from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Iterator

import elasticapm
from elasticapm.contrib.starlette import make_apm_client as _make_apm_client

from config import (
    get_elastic_apm_environment,
    get_elastic_apm_secret_token,
    get_elastic_apm_server_url,
    get_elastic_apm_service_name,
    get_elastic_apm_transaction_sample_rate,
    get_log_service,
)

_apm_client: Any | None = None


def reset_apm_client() -> None:
    global _apm_client
    _apm_client = None


def make_apm_client() -> Any | None:
    global _apm_client
    if _apm_client is not None:
        return _apm_client

    server_url = get_elastic_apm_server_url()
    if not server_url:
        return None

    config: dict[str, Any] = {
        "SERVICE_NAME": get_elastic_apm_service_name(),
        "SERVER_URL": server_url,
        "ENVIRONMENT": get_elastic_apm_environment(),
        "TRANSACTION_SAMPLE_RATE": get_elastic_apm_transaction_sample_rate(),
        "TRANSACTIONS_IGNORE_PATTERNS": [
            "^GET /health",
            "^GET /live",
            "^GET /ready",
        ],
    }

    secret_token = get_elastic_apm_secret_token()
    if secret_token:
        config["SECRET_TOKEN"] = secret_token

    _apm_client = _make_apm_client(config)
    return _apm_client


def get_apm_client() -> Any | None:
    return _apm_client


def bind_elastic_trace_context(request_id: str, trace_id: str) -> None:
    if _apm_client is None:
        return

    elasticapm.set_custom_context(
        {
            "request_id": request_id,
            "trace_id": trace_id,
            "service": get_log_service(),
        }
    )


def get_elastic_trace_id() -> str | None:
    if _apm_client is None:
        return None

    trace_id = elasticapm.get_trace_id()
    return trace_id or None


@contextmanager
def repository_span(name: str) -> Iterator[None]:
    if _apm_client is None:
        yield
        return

    with elasticapm.capture_span(name, span_type="db", span_subtype="repository"):
        yield
