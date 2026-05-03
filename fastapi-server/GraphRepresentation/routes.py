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
    try:
        result = await auth_service.sign_up(body)
        return result

    except ValueError as exc:
        # Expected business-logic errors (duplicate username, email confirmed, etc.)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    except Exception as exc:
        # Log the FULL traceback so nothing is hidden
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
    try:
        result = await auth_service.sign_in(body)
        return result

    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    except Exception as exc:
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
    try:
        return await auth_service.refresh_tokens(body.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    except Exception as exc:
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
    try:
        available = await auth_service.is_username_available(username)
        return UsernameCheckResponse(username=username, available=available)
    except Exception as exc:
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
    await auth_service.sign_out()
    return MessageResponse(message="Logged out successfully.")


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get the current user's profile",
)
async def get_me(current_user: dict = Depends(get_current_user)) -> UserProfile:
    try:
        return await auth_service.get_profile_by_id(current_user["user_id"])
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
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
    try:
        return await auth_service.update_profile(current_user["user_id"], body)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
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
    try:
        return await auth_service.get_profile_by_username(username)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {type(exc).__name__}: {exc}",
        )