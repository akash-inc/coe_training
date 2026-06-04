import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Request
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from sqlalchemy.pool import NullPool, QueuePool

from sql_stats import (
    CountingSession,
    bind_request_to_session,
    get_request_query_count,
    register_engine_listeners,
)

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://akash:password@localhost/school",
)
DATABASE_ECHO = os.getenv("DATABASE_ECHO", "false").lower() in {"1", "true", "yes"}
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))

engine = create_engine(
    DATABASE_URL,
    echo=DATABASE_ECHO,
    poolclass=QueuePool,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    pool_recycle=POOL_RECYCLE,
    pool_pre_ping=True,
)

unpooled_engine = create_engine(
    DATABASE_URL,
    echo=DATABASE_ECHO,
    poolclass=NullPool,
)

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, class_=CountingSession)
UnpooledSessionLocal = sessionmaker(
    bind=unpooled_engine,
    expire_on_commit=False,
    class_=CountingSession,
)
Base = declarative_base()

register_engine_listeners(engine)
register_engine_listeners(unpooled_engine)


def get_pool_status() -> dict[str, int | str]:
    pool = engine.pool
    return {
        "pool_class": "QueuePool",
        "pool_size": pool.size(),
        "max_overflow": MAX_OVERFLOW,
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "total_connections": pool.size() + pool.overflow(),
    }


def get_db(request: Request) -> Generator[Session, None, None]:
    db = SessionLocal()
    bind_request_to_session(db, request)
    request.state.db_pool_mode = "pooled"
    try:
        yield db
    finally:
        request.state.sql_query_count = get_request_query_count(request)
        db.close()


def get_db_unpooled(request: Request) -> Generator[Session, None, None]:
    db = UnpooledSessionLocal()
    bind_request_to_session(db, request)
    request.state.db_pool_mode = "unpooled"
    try:
        yield db
    finally:
        request.state.sql_query_count = get_request_query_count(request)
        db.close()


def ping_database(session: Session) -> None:
    session.execute(text("SELECT 1"))
