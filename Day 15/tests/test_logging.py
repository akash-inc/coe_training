import json
import logging

from fastapi.testclient import TestClient

from logging_config import (
    JsonFormatter,
    resolve_http_log_level,
    setup_logging,
)
from main import app


def _parse_json_log_lines(output: str) -> list[dict]:
    return [json.loads(line) for line in output.splitlines() if line.startswith("{")]


def test_json_formatter_emits_aggregation_fields(monkeypatch):
    monkeypatch.setenv("LOG_SERVICE", "test-service")
    monkeypatch.setenv("LOG_ENVIRONMENT", "test")

    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="hello",
        args=(),
        exc_info=None,
    )
    record.event = "http.response"
    record.http_method = "GET"
    record.path = "/tasks"
    record.status_code = 200
    record.duration_ms = 3.5
    record.response_content_length = 42
    record.response_content_type = "application/json"

    payload = json.loads(formatter.format(record))

    assert payload["message"] == "hello"
    assert payload["level"] == "INFO"
    assert payload["severity"] == 6
    assert payload["service"] == "test-service"
    assert payload["environment"] == "test"
    assert payload["event"] == "http.response"
    assert payload["http_method"] == "GET"
    assert payload["path"] == "/tasks"
    assert payload["status_code"] == 200
    assert payload["duration_ms"] == 3.5
    assert payload["response_content_length"] == 42
    assert payload["response_content_type"] == "application/json"
    assert "timestamp" in payload


def test_resolve_http_log_level_maps_status_and_slow_requests():
    assert resolve_http_log_level(200, 10) == logging.INFO
    assert resolve_http_log_level(404, 10) == logging.WARNING
    assert resolve_http_log_level(500, 10) == logging.ERROR


def test_resolve_http_log_level_marks_slow_requests_as_warning(monkeypatch):
    import logging_config

    monkeypatch.setattr(logging_config, "get_slow_request_ms", lambda: 50)

    assert logging_config.resolve_http_log_level(200, 49) == logging.INFO
    assert logging_config.resolve_http_log_level(200, 50) == logging.WARNING


def test_request_middleware_adds_request_id_and_response_fields(monkeypatch, capsys):
    monkeypatch.setenv("LOG_FORMAT", "json")
    monkeypatch.setenv("LOG_LEVEL", "INFO")
    setup_logging()

    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    assert response.headers.get("x-request-id")

    response_log = next(
        item for item in _parse_json_log_lines(capsys.readouterr().out)
        if item["event"] == "http.response"
    )

    assert response_log["http_method"] == "GET"
    assert response_log["path"] == "/"
    assert response_log["status_code"] == 200
    assert response_log["response_content_type"] == "application/json"
    assert response_log["request_id"] == response.headers["x-request-id"]


def test_request_middleware_logs_4xx_as_warning(monkeypatch, capsys, client):
    monkeypatch.setenv("LOG_FORMAT", "json")
    monkeypatch.setenv("LOG_LEVEL", "INFO")
    setup_logging()

    response = client.get("/tasks")

    assert response.status_code == 401
    response_log = next(
        item for item in _parse_json_log_lines(capsys.readouterr().out)
        if item["event"] == "http.response"
    )
    assert response_log["level"] == "WARNING"
    assert response_log["severity"] == 4
    assert response_log["status_code"] == 401


def test_sanitize_query_string_redacts_sensitive_params(monkeypatch, capsys):
    monkeypatch.setenv("LOG_FORMAT", "json")
    monkeypatch.setenv("LOG_LEVEL", "INFO")
    setup_logging()

    with TestClient(app) as client:
        response = client.get("/?token=secret-value&page=2")

    assert response.status_code == 200
    response_log = next(
        item for item in _parse_json_log_lines(capsys.readouterr().out)
        if item["event"] == "http.response"
    )
    assert "secret-value" not in response_log["query_string"]
    assert "token=" in response_log["query_string"]
    assert "REDACTED" in response_log["query_string"]
    assert "page=2" in response_log["query_string"]


def test_http_response_includes_route_template(monkeypatch, capsys, client):
    monkeypatch.setenv("LOG_FORMAT", "json")
    monkeypatch.setenv("LOG_LEVEL", "INFO")
    setup_logging()

    token = client.post(
        "/token",
        json={"email": "test@example.com", "password": "password"},
    ).json()["access_token"]

    response = client.get("/tasks/1", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    response_log = next(
        item for item in _parse_json_log_lines(capsys.readouterr().out)
        if item["event"] == "http.response" and item.get("path") == "/tasks/1"
    )
    assert response_log["route_template"] == "/tasks/{task_id}"
