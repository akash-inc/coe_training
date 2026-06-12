import json
import logging
from urllib.parse import urlencode  # used by websocket trace query test

from fastapi.testclient import TestClient

from logging_config import JsonFormatter, setup_logging
from main import app
from tracing import bind_trace_context, resolve_request_id, resolve_trace_id


def test_resolve_request_id_rejects_invalid_values():
    generated = resolve_request_id("not valid!")
    assert generated
    assert " " not in generated


def test_resolve_trace_id_falls_back_to_request_id():
    assert resolve_trace_id(None, fallback="req-123") == "req-123"


def test_http_request_propagates_client_trace_headers(monkeypatch, capsys):
    monkeypatch.setenv("LOG_FORMAT", "json")
    monkeypatch.setenv("LOG_LEVEL", "INFO")
    setup_logging()

    client_request_id = "client-req-001"
    client_trace_id = "client-trace-abc"

    with TestClient(app) as client:
        response = client.get(
            "/",
            headers={
                "X-Request-ID": client_request_id,
                "X-Trace-ID": client_trace_id,
            },
        )

    assert response.status_code == 200
    assert response.headers["x-request-id"] == client_request_id
    assert response.headers["x-trace-id"] == client_trace_id

    logs = [
        json.loads(line)
        for line in capsys.readouterr().out.splitlines()
        if line.startswith("{")
    ]
    payload = next(item for item in logs if item["event"] == "http.response")

    assert payload["request_id"] == client_request_id
    assert payload["trace_id"] == client_trace_id


def test_bind_trace_context_adds_ids_to_json_logs():
    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="main",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="websocket connected",
        args=(),
        exc_info=None,
    )
    record.event = "ws.connect"

    with bind_trace_context("ws-req-001", "ws-trace-001"):
        payload = json.loads(formatter.format(record))

    assert payload["request_id"] == "ws-req-001"
    assert payload["trace_id"] == "ws-trace-001"
    assert payload["event"] == "ws.connect"


def test_websocket_accepts_trace_query_params(client):
    token = client.post(
        "/token",
        json={"email": "test@example.com", "password": "password"},
    ).json()["access_token"]

    query = urlencode(
        {
            "token": token,
            "trace_id": "ws-trace-001",
            "request_id": "ws-req-001",
        }
    )
    with client.websocket_connect(f"/ws/tasks/1?{query}") as websocket:
        snapshot = websocket.receive_json()

    assert snapshot["type"] == "comments.snapshot"
