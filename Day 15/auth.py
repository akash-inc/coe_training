import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    DEMO_USER_EMAIL,
    DEMO_USER_PASSWORD,
    JWT_ALGORITHM,
    JWT_SECRET,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# In-memory refresh token store: token -> (email, expires_at)
_refresh_tokens: dict[str, tuple[str, datetime]] = {}


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token() -> str:
    return secrets.token_urlsafe(32)


def issue_refresh_token(email: str) -> str:
    for token, (stored_email, _) in list(_refresh_tokens.items()):
        if stored_email == email:
            del _refresh_tokens[token]

    token = create_refresh_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    _refresh_tokens[token] = (email, expires_at)
    return token


def validate_refresh_token(token: str) -> str:
    record = _refresh_tokens.get(token)
    if record is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    email, expires_at = record
    if expires_at < datetime.now(timezone.utc):
        del _refresh_tokens[token]
        raise HTTPException(status_code=401, detail="Expired refresh token")

    return email


def revoke_refresh_token(token: str) -> None:
    _refresh_tokens.pop(token, None)


def verify_credentials(email: str, password: str) -> str:
    if email != DEMO_USER_EMAIL or password != DEMO_USER_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return email


def _decode_token(token: str) -> str:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    return _decode_token(token)


def get_user_from_token(token: str) -> str:
    return _decode_token(token)
