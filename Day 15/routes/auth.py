import logging

from fastapi import APIRouter, Depends, HTTPException, Response

from auth import (
    LoginRequest,
    RefreshTokenRequest,
    create_access_token,
    get_current_user,
    issue_refresh_token,
    revoke_refresh_token,
    validate_refresh_token,
    verify_credentials,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/me")
def current_user(current_user: str = Depends(get_current_user)):
    return {"email": current_user}


@router.post("/token")
def login(data: LoginRequest):
    try:
        email = verify_credentials(data.email, data.password)
    except HTTPException:
        logger.warning(
            "login failed",
            extra={"event": "auth.login_failed", "user_email": data.email},
        )
        raise
    access_token = create_access_token({"sub": email})
    refresh_token = issue_refresh_token(email)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/token/refresh")
def refresh_access_token(payload: RefreshTokenRequest):
    email = validate_refresh_token(payload.refresh_token)
    access_token = create_access_token({"sub": email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", status_code=204)
def logout(payload: RefreshTokenRequest):
    revoke_refresh_token(payload.refresh_token)
    return Response(status_code=204)
