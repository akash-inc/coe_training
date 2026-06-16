import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

DEFAULT_DATABASE_URL = "postgresql+psycopg://akash:password@localhost/day15_tasks"
DEFAULT_CORS_ORIGINS = "http://127.0.0.1:5173,http://localhost:5173"


def normalize_database_url(url: str) -> str:
    """Railway and other hosts often provide postgres:// or postgresql:// URLs."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and "+psycopg" not in url and "+asyncpg" not in url:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def get_database_url() -> str:
    raw = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)
    return normalize_database_url(raw)


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

DEMO_USER_EMAIL = os.getenv("DEMO_USER_EMAIL", "test@example.com")
DEMO_USER_PASSWORD = os.getenv("DEMO_USER_PASSWORD", "password")

PORT = int(os.getenv("PORT", "8000"))

DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_LOG_FORMAT = "json"
DEFAULT_LOG_SERVICE = "day15-api"
DEFAULT_LOG_ENVIRONMENT = "development"


def get_log_level() -> str:
    return os.getenv("LOG_LEVEL", DEFAULT_LOG_LEVEL).upper()


def get_log_format() -> str:
    return os.getenv("LOG_FORMAT", DEFAULT_LOG_FORMAT).lower()


def get_log_service() -> str:
    return os.getenv("LOG_SERVICE", DEFAULT_LOG_SERVICE)


def get_log_environment() -> str:
    return os.getenv("LOG_ENVIRONMENT", DEFAULT_LOG_ENVIRONMENT)


def get_slow_request_ms() -> int | None:
    raw = os.getenv("LOG_SLOW_REQUEST_MS", "1000").strip()
    if not raw or raw == "0":
        return None
    return int(raw)


def get_sentry_dsn() -> str | None:
    raw = os.getenv("SENTRY_DSN", "").strip()
    return raw or None


def get_sentry_traces_sample_rate() -> float:
    raw = os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0").strip()
    try:
        rate = float(raw)
    except ValueError:
        return 0.0
    return max(0.0, min(1.0, rate))


def get_elastic_apm_server_url() -> str | None:
    raw = os.getenv("ELASTIC_APM_SERVER_URL", "").strip()
    return raw or None


def get_elastic_apm_secret_token() -> str | None:
    raw = os.getenv("ELASTIC_APM_SECRET_TOKEN", "").strip()
    return raw or None


def get_elastic_apm_service_name() -> str:
    return os.getenv("ELASTIC_APM_SERVICE_NAME", DEFAULT_LOG_SERVICE)


def get_elastic_apm_environment() -> str:
    return os.getenv("ELASTIC_APM_ENVIRONMENT", get_log_environment())


def get_elastic_apm_transaction_sample_rate() -> float:
    raw = os.getenv("ELASTIC_APM_TRANSACTION_SAMPLE_RATE", "1.0").strip()
    try:
        rate = float(raw)
    except ValueError:
        return 1.0
    return max(0.0, min(1.0, rate))
