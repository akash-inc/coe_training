from unittest.mock import MagicMock

import pytest
from sqlalchemy.exc import SQLAlchemyError

from health import build_health_response, check_database


def test_live_returns_ok(client):
    response = client.get("/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready_returns_healthy_when_database_is_up(client):
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["checks"]["database"]["status"] == "up"


def test_ready_returns_503_when_database_is_down(client, monkeypatch):
    from health import DependencyCheck

    monkeypatch.setattr(
        "health.check_database",
        lambda _session: DependencyCheck(status="down", detail="connection failed"),
    )

    response = client.get("/ready")
    assert response.status_code == 503
    assert response.json()["detail"]["status"] == "unhealthy"


def test_check_database_reports_down_on_sqlalchemy_error():
    session = MagicMock()
    session.execute.side_effect = SQLAlchemyError("connection refused")

    result = check_database(session)

    assert result.status == "down"
    assert result.detail == "connection failed"


def test_build_health_response_marks_unhealthy_when_database_is_down(monkeypatch):
    from health import DependencyCheck

    monkeypatch.setattr(
        "health.check_database",
        lambda _session: DependencyCheck(status="down", detail="connection failed"),
    )

    session = MagicMock()
    health = build_health_response(session)

    assert health.status == "unhealthy"
    assert health.checks["database"].status == "down"
