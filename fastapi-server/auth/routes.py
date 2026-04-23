"""
auth/routes.py
FastAPI router for all authentication endpoints.
Mount in main.py:  app.include_router(auth_router)
"""
from __future__ import annotations

import logging
import traceback

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .models import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    ProfileUpdate,
    RefreshRequest,
    SignupRequest,
    TokenRefreshResponse,
    UserProfile,
    UsernameCheckResponse,
)
from .service import auth_service

# ─────────────────────────────────────────────
# Logger — output goes to uvicorn console
# ─────────────────────────────────────────────
logger = logging.getLogger("auth")
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
_bearer = HTTPBearer()


# ─────────────────────────────────────────────
# Dependency: resolve current user from JWT
# ─────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    try:
        return await auth_service.verify_token(credentials.credentials)
    except ValueError as exc:
        logger.warning("Token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )


# ─────────────────────────────────────────────
# Public routes
# ─────────────────────────────────────────────

@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(body: SignupRequest) -> AuthResponse:
    logger.debug("POST /auth/signup — email=%s username=%s profession=%s",
                 body.email, body.username, body.profession)
    try:
        result = await auth_service.sign_up(body)
        logger.info("Signup success — user_id=%s username=%s", result.user.id, result.user.username)
        return result

    except ValueError as exc:
        # Expected business-logic errors (duplicate username, email confirmed, etc.)
        logger.warning("Signup ValueError: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    except Exception as exc:
        # Log the FULL traceback so nothing is hidden
        logger.error("Signup unexpected error:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {type(exc).__name__}: {exc}",  # expose detail in dev
        )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login with email and password",
)
async def login(body: LoginRequest) -> AuthResponse:
    logger.debug("POST /auth/login — email=%s", body.email)
    try:
        result = await auth_service.sign_in(body)
        logger.info("Login success — user_id=%s", result.user.id)
        return result

    except ValueError as exc:
        logger.warning("Login failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    except Exception as exc:
        logger.error("Login unexpected error:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {type(exc).__name__}: {exc}",
        )


@router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    summary="Refresh access token",
)
async def refresh_token(body: RefreshRequest) -> TokenRefreshResponse:
    logger.debug("POST /auth/refresh")
    try:
        return await auth_service.refresh_tokens(body.refresh_token)
    except ValueError as exc:
        logger.warning("Token refresh failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    except Exception as exc:
        logger.error("Token refresh unexpected error:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {type(exc).__name__}: {exc}",
        )


@router.get(
    "/check-username/{username}",
    response_model=UsernameCheckResponse,
    summary="Check if a username is available",
)
async def check_username(username: str) -> UsernameCheckResponse:
    logger.debug("GET /auth/check-username/%s", username)
    try:
        available = await auth_service.is_username_available(username)
        logger.debug("Username '%s' available=%s", username, available)
        return UsernameCheckResponse(username=username, available=available)
    except Exception as exc:
        logger.error("check_username error:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Username check failed: {type(exc).__name__}: {exc}",
        )


# ─────────────────────────────────────────────
# Protected routes (require Bearer token)
# ─────────────────────────────────────────────

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout current user",
)
async def logout(_: dict = Depends(get_current_user)) -> MessageResponse:
    logger.debug("POST /auth/logout")
    await auth_service.sign_out()
    return MessageResponse(message="Logged out successfully.")


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get the current user's profile",
)
async def get_me(current_user: dict = Depends(get_current_user)) -> UserProfile:
    logger.debug("GET /auth/me — user_id=%s", current_user["user_id"])
    try:
        return await auth_service.get_profile_by_id(current_user["user_id"])
    except ValueError as exc:
        logger.warning("get_me not found: %s", exc)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.error("get_me unexpected error:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {type(exc).__name__}: {exc}",
        )


@router.patch(
    "/me",
    response_model=UserProfile,
    summary="Update the current user's profile",
)
async def update_me(
    body: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
) -> UserProfile:
    logger.debug("PATCH /auth/me — user_id=%s payload=%s", current_user["user_id"], body.model_dump(exclude_none=True))
    try:
        return await auth_service.update_profile(current_user["user_id"], body)
    except ValueError as exc:
        logger.warning("update_me failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("update_me unexpected error:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update failed: {type(exc).__name__}: {exc}",
        )


@router.get(
    "/users/{username}",
    response_model=UserProfile,
    summary="Get a public profile by username",
)
async def get_user_profile(username: str) -> UserProfile:
    logger.debug("GET /auth/users/%s", username)
    try:
        return await auth_service.get_profile_by_username(username)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.error("get_user_profile unexpected error:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {type(exc).__name__}: {exc}",
        )