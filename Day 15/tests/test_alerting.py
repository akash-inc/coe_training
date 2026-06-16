import logging
from unittest.mock import MagicMock

import pytest

from alerting import report_critical_error, report_exception_as_critical


def test_report_critical_error_logs_with_alert_fields(monkeypatch):
    mock_error = MagicMock()
    monkeypatch.setattr("alerting.logger.error", mock_error)

    report_critical_error(
        "payment processor unavailable",
        event="payments.gateway_down",
        gateway="stripe",
    )

    mock_error.assert_called_once()
    message, kwargs = mock_error.call_args.args[0], mock_error.call_args.kwargs
    assert message == "payment processor unavailable"
    assert kwargs["extra"]["event"] == "payments.gateway_down"
    assert kwargs["extra"]["alert"] == "critical"
    assert kwargs["extra"]["gateway"] == "stripe"


def test_report_critical_error_noops_sentry_without_dsn(monkeypatch):
    monkeypatch.delenv("SENTRY_DSN", raising=False)
    monkeypatch.setattr("alerting.get_sentry_dsn", lambda: None)

    report_critical_error("disk full", event="infra.disk_full")


def test_report_critical_error_sends_fatal_to_sentry_when_configured(monkeypatch):
    mock_capture = MagicMock()
    mock_scope = MagicMock()
    mock_scope.__enter__ = MagicMock(return_value=mock_scope)
    mock_scope.__exit__ = MagicMock(return_value=False)

    monkeypatch.setattr("alerting.get_sentry_dsn", lambda: "https://example.ingest.sentry.io/1")
    monkeypatch.setattr("alerting.sentry_sdk.new_scope", lambda: mock_scope)
    monkeypatch.setattr("alerting.sentry_sdk.capture_message", mock_capture)
    monkeypatch.setattr("alerting.logger.error", MagicMock())

    report_critical_error("disk full", event="infra.disk_full", host="api-1")

    mock_capture.assert_called_once_with("disk full", level="fatal")
    mock_scope.set_tag.assert_any_call("alert", "critical")
    mock_scope.set_tag.assert_any_call("event", "infra.disk_full")


def test_report_exception_as_critical_logs_exception(monkeypatch):
    mock_exception = MagicMock()
    monkeypatch.setattr("alerting.logger.exception", mock_exception)
    monkeypatch.setattr("alerting.get_sentry_dsn", lambda: None)

    exc = RuntimeError("boom")
    report_exception_as_critical(
        "background job failed",
        event="jobs.sync_failed",
        exc=exc,
        job_id=42,
    )

    mock_exception.assert_called_once()
    message, kwargs = mock_exception.call_args.args[0], mock_exception.call_args.kwargs
    assert message == "background job failed"
    assert kwargs["extra"]["event"] == "jobs.sync_failed"
    assert kwargs["extra"]["job_id"] == 42
