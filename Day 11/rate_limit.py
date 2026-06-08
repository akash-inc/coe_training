import os

from fastapi import Request
from jose import JWTError, jwt
from slowapi import Limiter
from slowapi.util import get_remote_address

from auth import ALGORITHM, JWT_SECRET

DEFAULT_RATE_LIMIT = os.getenv("RATE_LIMIT_DEFAULT", "100/minute")
LOGIN_RATE_LIMIT = os.getenv("RATE_LIMIT_LOGIN", "10/minute")
REGISTER_RATE_LIMIT = os.getenv("RATE_LIMIT_REGISTER", "5/minute")
RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() != "false"


def get_rate_limit_key(request: Request) -> str:
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth.removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
            sub = payload.get("sub")
            if sub is not None:
                return f"user:{sub}"
        except JWTError:
            pass
    return get_remote_address(request)


limiter = Limiter(
    key_func=get_rate_limit_key,
    enabled=RATE_LIMIT_ENABLED,
)
