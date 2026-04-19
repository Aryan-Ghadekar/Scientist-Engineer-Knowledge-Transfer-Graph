"""
auth/__init__.py
Public surface of the auth package.

Usage in main.py:
    from auth import router as auth_router
    app.include_router(auth_router)
"""
from .routes import router
from .service import auth_service
from .models import (
    ProfessionType,
    SignupRequest,
    LoginRequest,
    RefreshRequest,
    ProfileUpdate,
    UserProfile,
    AuthResponse,
    TokenRefreshResponse,
    MessageResponse,
    UsernameCheckResponse,
)

__all__ = [
    "router",
    "auth_service",
    "ProfessionType",
    "SignupRequest",
    "LoginRequest",
    "RefreshRequest",
    "ProfileUpdate",
    "UserProfile",
    "AuthResponse",
    "TokenRefreshResponse",
    "MessageResponse",
    "UsernameCheckResponse",
]