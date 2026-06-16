from __future__ import annotations

import logging
from typing import Any

import sentry_sdk

from config import get_sentry_dsn

logger = logging.getLogger("day15.alerts")


def report_critical_error(message: str, *, event: str, **context: Any) -> None:
    """Log and forward a business-critical failure for on-call alerting."""
    extra = {"event": event, "alert": "critical", **context}
    logger.error(message, extra=extra)

    if not get_sentry_dsn():
        return

    with sentry_sdk.new_scope() as scope:
        scope.set_level("fatal")
        scope.set_tag("alert", "critical")
        scope.set_tag("event", event)
        for key, value in context.items():
            scope.set_extra(key, value)
        sentry_sdk.capture_message(message, level="fatal")


def report_exception_as_critical(
    message: str,
    *,
    event: str,
    exc: BaseException,
    **context: Any,
) -> None:
    extra = {"event": event, "alert": "critical", **context}
    logger.exception(message, extra=extra)

    if not get_sentry_dsn():
        return

    with sentry_sdk.new_scope() as scope:
        scope.set_level("fatal")
        scope.set_tag("alert", "critical")
        scope.set_tag("event", event)
        for key, value in context.items():
            scope.set_extra(key, value)
        sentry_sdk.capture_exception(exc)
