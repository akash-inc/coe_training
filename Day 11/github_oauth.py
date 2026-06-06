import logging
import os
from pathlib import Path
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv
from jose import JWTError, jwt

from auth import ALGORITHM, JWT_SECRET

load_dotenv(Path(__file__).resolve().parent / ".env")

logger = logging.getLogger(__name__)

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GITHUB_REDIRECT_URI = os.getenv(
    "GITHUB_REDIRECT_URI",
    "http://127.0.0.1:8000/auth/github/callback",
)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173")
GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"
GITHUB_USER_AGENT = "Day11-TaskManager"


def _github_headers(github_access_token: str | None = None) -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": GITHUB_USER_AGENT,
    }
    if github_access_token:
        headers["Authorization"] = f"Bearer {github_access_token}"
    return headers


def github_oauth_configured() -> bool:
    return bool(GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET)


def create_github_oauth_state() -> str:
    from datetime import datetime, timedelta, timezone

    expire = datetime.now(timezone.utc) + timedelta(minutes=10)
    return jwt.encode({"purpose": "github_oauth", "exp": expire}, JWT_SECRET, algorithm=ALGORITHM)


def verify_github_oauth_state(state: str) -> bool:
    try:
        payload = jwt.decode(state, JWT_SECRET, algorithms=[ALGORITHM])
        return payload.get("purpose") == "github_oauth"
    except JWTError:
        return False


def build_github_authorize_url(state: str) -> str:
    params = urlencode(
        {
            "client_id": GITHUB_CLIENT_ID,
            "redirect_uri": GITHUB_REDIRECT_URI,
            "scope": "read:user user:email",
            "state": state,
        }
    )
    return f"{GITHUB_AUTHORIZE_URL}?{params}"


async def exchange_github_code(code: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json", "User-Agent": GITHUB_USER_AGENT},
            json={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
        )
        response.raise_for_status()
        data = response.json()
        access_token = data.get("access_token")
        if not access_token:
            raise ValueError(data.get("error_description", "GitHub token exchange failed"))
        return access_token


async def fetch_github_profile(github_access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GITHUB_USER_URL,
            headers=_github_headers(github_access_token),
        )
        response.raise_for_status()
        return response.json()


async def fetch_github_primary_email(github_access_token: str) -> str | None:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GITHUB_EMAILS_URL,
            headers=_github_headers(github_access_token),
        )
        response.raise_for_status()
        emails = response.json()

    for entry in emails:
        if entry.get("primary") and entry.get("verified"):
            return entry.get("email")
    for entry in emails:
        if entry.get("verified"):
            return entry.get("email")
    return None
