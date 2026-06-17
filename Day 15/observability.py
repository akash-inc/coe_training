from elasticapm.contrib.starlette import ElasticAPM
from fastapi import FastAPI

from elastic_apm_config import make_apm_client
from logging_config import RequestLoggingMiddleware, setup_logging
from sentry_config import init_sentry


def configure_observability(app: FastAPI) -> None:
    init_sentry()
    setup_logging()
    app.add_middleware(RequestLoggingMiddleware)
    apm_client = make_apm_client()
    if apm_client:
        app.add_middleware(ElasticAPM, client=apm_client)
