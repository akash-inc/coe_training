from __future__ import annotations

import logging
from typing import Literal

from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class DependencyCheck(BaseModel):
    status: Literal["up", "down"]
    latency_ms: float | None = None
    detail: str | None = None


class HealthResponse(BaseModel):
    status: Literal["healthy", "unhealthy"]
    checks: dict[str, DependencyCheck]


class LiveResponse(BaseModel):
    status: Literal["ok"]


def check_database(session: Session) -> DependencyCheck:
    import time

    start = time.perf_counter()
    try:
        session.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return DependencyCheck(status="up", latency_ms=latency_ms)
    except SQLAlchemyError as exc:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.warning(
            "database health check failed",
            extra={"event": "health.database.failed", "detail": str(exc)},
        )
        return DependencyCheck(status="down", latency_ms=latency_ms, detail="connection failed")


def build_health_response(session: Session) -> HealthResponse:
    database = check_database(session)
    status: Literal["healthy", "unhealthy"] = (
        "healthy" if database.status == "up" else "unhealthy"
    )
    return HealthResponse(status=status, checks={"database": database})
