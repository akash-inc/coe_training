from unittest.mock import MagicMock, patch

import pytest

from config import get_sentry_dsn, get_sentry_traces_sample_rate
from sentry_config import bind_sentry_trace_context, init_sentry


def test_get_sentry_dsn_returns_none_when_unset(monkeypatch):
    monkeypatch.delenv("SENTRY_DSN", raising=False)
    assert get_sentry_dsn() is None


def test_get_sentry_dsn_strips_whitespace(monkeypatch):
    monkeypatch.setenv("SENTRY_DSN", "  https://example.ingest.sentry.io/1  ")
    assert get_sentry_dsn() == "https://example.ingest.sentry.io/1"


def test_get_sentry_traces_sample_rate_clamps_values(monkeypatch):
    monkeypatch.setenv("SENTRY_TRACES_SAMPLE_RATE", "2.5")
    assert get_sentry_traces_sample_rate() == 1.0

    monkeypatch.setenv("SENTRY_TRACES_SAMPLE_RATE", "not-a-number")
    assert get_sentry_traces_sample_rate() == 0.0


def test_init_sentry_is_noop_without_dsn(monkeypatch):
    monkeypatch.delenv("SENTRY_DSN", raising=False)
    assert init_sentry() is False


def test_bind_sentry_trace_context_is_noop_without_dsn(monkeypatch):
    monkeypatch.delenv("SENTRY_DSN", raising=False)
    mock_scope = MagicMock()
    with patch("sentry_sdk.get_isolation_scope", return_value=mock_scope):
        bind_sentry_trace_context("req-1", "trace-1")
    mock_scope.set_tag.assert_not_called()
