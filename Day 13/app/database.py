import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from sql_stats import CountingSession, bind_request_to_session

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://akash:password@localhost/school",
)
DATABASE_ECHO = os.getenv("DATABASE_ECHO", "false").lower() in {"1", "true", "yes"}

engine = create_engine(
    DATABASE_URL,
    echo=DATABASE_ECHO,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, class_=CountingSession)
Base = declarative_base()

from sql_stats import register_engine_listeners  # noqa: E402

register_engine_listeners(engine)


def get_db(request: Request) -> Generator[Session, None, None]:
    db = SessionLocal()
    bind_request_to_session(db, request)
    try:
        yield db
    finally:
        db.close()
