"""
auth/service.py
Uses admin.create_user (email_confirm=True) so no confirmation
email is ever sent — matches the working reference pattern.
"""
from __future__ import annotations

import logging
import os
import traceback

from dotenv import load_dotenv

from .schemas import (
    AuthResponse,
    LoginRequest,
    ProfileUpdate,
    SignupRequest,
    TokenRefreshResponse,
    UserProfile,
)
from jose import jwt, JWTError

from config.postgres_db import SessionLocal
from .models import User

from .security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM,
)

load_dotenv()
# ─────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────

def _row_to_profile(user: User) -> UserProfile:
    return UserProfile(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        profession=user.profession,
        organization=user.organization,
        department=user.department,
        bio=user.bio,
        avatar_url=user.avatar_url,
        website_url=user.website_url,
        is_verified=user.is_verified,
        created_at=user.created_at,
    )

def _fetch_profile(user_id: str) -> UserProfile:

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise ValueError(
                f"User with id '{user_id}' not found."
            )

        return _row_to_profile(user)

    finally:
        db.close()


# ─────────────────────────────────────────────
# AuthService
# ─────────────────────────────────────────────

class AuthService:

    # ── Sign-up ──────────────────────────────

    async def sign_up(self, data: SignupRequest) -> AuthResponse:
        """
        1. Check username uniqueness.
        2. admin.create_user with email_confirm=True — no confirmation email.
        3. DB trigger auto-inserts into public.profiles.
        4. Sign in immediately to get JWT session tokens.
        5. Return tokens + profile.
        """

        # 1. Username check
        if not await self.is_username_available(data.username):
            raise ValueError("Username is already taken.")

        db = SessionLocal()
        # 2. Create user via admin API — email_confirm=True skips confirmation email
        try:
            db_user = User(
                email=data.email,
                username=data.username.lower(),
                password_hash=hash_password(
                    data.password
                ),
                full_name=data.full_name,
                profession=data.profession.value,
                organization=data.organization,
                department=data.department
            )

            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        except Exception as exc:
            raise ValueError(f"Signup failed: {exc}") from exc

        user = db_user 
        if not user:
            raise ValueError("Signup failed — returned no user.")
        
        # 4. Fetch the auto-created profile (created by DB trigger)
        profile = _fetch_profile(user.id)

        return AuthResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            user=profile,
        )

    # ── Sign-in ──────────────────────────────

    async def sign_in(self, data: LoginRequest) -> AuthResponse:
        db = SessionLocal()
        try:
            user = db.query(User).filter(
                User.email == data.email
            ).first()

            if not user:
                raise ValueError(
                    "Invalid email or password"
                )

            if not verify_password(
                data.password,
                user.password_hash
            ):
                raise ValueError(
                    "Invalid email or password"
                )
        except Exception as exc:
            raise ValueError("Invalid email or password.") from exc

        if user is None:
            raise ValueError("Invalid email or password.")

        profile = _fetch_profile(user.id)

        return AuthResponse(
            access_token  = create_access_token(user.id),
            refresh_token = create_refresh_token(user.id),
            user          = profile,
        )

    # ── Sign-out ─────────────────────────────

    async def sign_out(self) -> None:
        return None

    # ── Token verification ────────────────────

    async def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM]
            )

            user_id = payload["sub"]

            return {
                "user_id": user_id
            }
        except Exception as exc:
            raise ValueError("Token is invalid or expired.") from exc

    # ── Token refresh ─────────────────────────

    async def refresh_tokens(self, refresh_token: str) -> TokenRefreshResponse:
        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload["sub"]

        return TokenRefreshResponse(
            access_token=create_access_token(user_id),
            refresh_token=create_refresh_token(user_id)
        )

    # ── Profile CRUD ──────────────────────────

    async def get_profile_by_id(
        self,
        user_id: str
    ) -> UserProfile:

        db = SessionLocal()

        try:
            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if not user:
                raise ValueError(
                    f"User with id '{user_id}' not found."
                )

            return _row_to_profile(user)

        finally:
            db.close()

    async def get_profile_by_username(
        self,
        username: str
    ) -> UserProfile:

        db = SessionLocal()

        try:
            user = db.query(User).filter(
                User.username == username.lower()
            ).first()

            if not user:
                raise ValueError(
                    f"User '{username}' not found."
                )

            return _row_to_profile(user)

        finally:
            db.close()

    async def update_profile(
        self,
        user_id: str,
        data: ProfileUpdate
    ) -> UserProfile:

        db = SessionLocal()

        try:

            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if not user:
                raise ValueError(
                    "User not found."
                )

            payload = data.model_dump(
                exclude_unset=True
            )

            if not payload:
                return _row_to_profile(user)

            for key, value in payload.items():
                setattr(user, key, value)

            db.commit()
            db.refresh(user)

            return _row_to_profile(user)

        finally:
            db.close()

    # ── Username availability ─────────────────

    async def is_username_available(
        self,
        username: str
    ) -> bool:

        db = SessionLocal()

        try:

            existing_user = db.query(User).filter(
                User.username == username.lower()
            ).first()

            return existing_user is None

        finally:
            db.close()


auth_service = AuthService()