import json
import logging

from fastapi.testclient import TestClient

from logging_config import JsonFormatter, setup_logging
from main import app


def test_json_formatter_emits_parseable_object():
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
    record.event = "test.event"
    record.http_method = "GET"
    record.path = "/health"
    record.status_code = 200

    payload = json.loads(formatter.format(record))

    assert payload["message"] == "hello"
    assert payload["level"] == "INFO"
    assert payload["event"] == "test.event"
    assert payload["http_method"] == "GET"
    assert payload["path"] == "/health"
    assert payload["status_code"] == 200
    assert "timestamp" in payload


def test_request_middleware_adds_request_id_header(monkeypatch):
    monkeypatch.setenv("LOG_FORMAT", "text")
    setup_logging()

    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    assert response.headers.get("x-request-id")
