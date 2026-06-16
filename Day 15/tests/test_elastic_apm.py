from elastic_apm_config import make_apm_client, repository_span, reset_apm_client
from config import (
    get_elastic_apm_environment,
    get_elastic_apm_server_url,
    get_elastic_apm_service_name,
    get_elastic_apm_transaction_sample_rate,
)


def test_get_elastic_apm_server_url_returns_none_when_unset(monkeypatch):
    monkeypatch.delenv("ELASTIC_APM_SERVER_URL", raising=False)
    assert get_elastic_apm_server_url() is None


def test_get_elastic_apm_service_name_defaults_to_day15_api(monkeypatch):
    monkeypatch.delenv("ELASTIC_APM_SERVICE_NAME", raising=False)
    assert get_elastic_apm_service_name() == "day15-api"


def test_get_elastic_apm_environment_falls_back_to_log_environment(monkeypatch):
    monkeypatch.delenv("ELASTIC_APM_ENVIRONMENT", raising=False)
    monkeypatch.setenv("LOG_ENVIRONMENT", "staging")
    assert get_elastic_apm_environment() == "staging"


def test_get_elastic_apm_transaction_sample_rate_clamps_values(monkeypatch):
    monkeypatch.setenv("ELASTIC_APM_TRANSACTION_SAMPLE_RATE", "2.5")
    assert get_elastic_apm_transaction_sample_rate() == 1.0

    monkeypatch.setenv("ELASTIC_APM_TRANSACTION_SAMPLE_RATE", "invalid")
    assert get_elastic_apm_transaction_sample_rate() == 1.0


def test_make_apm_client_returns_none_when_disabled(monkeypatch):
    monkeypatch.delenv("ELASTIC_APM_SERVER_URL", raising=False)
    reset_apm_client()
    assert make_apm_client() is None


def test_repository_span_is_noop_when_disabled():
    with repository_span("task.list_all"):
        assert True


def test_app_serves_root_when_apm_disabled(monkeypatch):
    monkeypatch.delenv("ELASTIC_APM_SERVER_URL", raising=False)
    reset_apm_client()

    from fastapi.testclient import TestClient
    from main import app

    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
