from elasticapm.contrib.starlette import ElasticAPM
from fastapi import FastAPI

from elastic_apm_config import bind_elastic_trace_context, make_apm_client
from logging_config import RequestLoggingMiddleware, setup_logging
from sentry_config import bind_sentry_trace_context, init_sentry
from tracing import register_trace_backend


def configure_observability(app: FastAPI) -> None:
    init_sentry()
    setup_logging()
    register_trace_backend(bind_sentry_trace_context)
    register_trace_backend(bind_elastic_trace_context)
    app.add_middleware(RequestLoggingMiddleware)
    apm_client = make_apm_client()
    if apm_client:
        app.add_middleware(ElasticAPM, client=apm_client)
