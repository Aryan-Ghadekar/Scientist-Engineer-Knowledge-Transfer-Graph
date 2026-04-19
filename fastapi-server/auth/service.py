"""
auth/service.py
All Supabase interactions for authentication and profile management.
Uses anon client for user-facing auth, admin (service-role) client
for operations that need to bypass RLS (e.g. reading any profile).
"""
from __future__ import annotations

import os
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

from .models import (
    AuthResponse,
    LoginRequest,
    ProfileUpdate,
    SignupRequest,
    TokenRefreshResponse,
    UserProfile,
)

load_dotenv()

# ─────────────────────────────────────────────
# Supabase clients
# ─────────────────────────────────────────────

_SUPABASE_URL         = os.environ["SUPABASE_URL"]
_SUPABASE_ANON_KEY    = os.environ["SUPABASE_ANON_KEY"]
_SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# Public client — uses anon key, respects RLS
supabase: Client = create_client(_SUPABASE_URL, _SUPABASE_ANON_KEY)

# Admin client — uses service role key, bypasses RLS
supabase_admin: Client = create_client(_SUPABASE_URL, _SUPABASE_SERVICE_KEY)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _row_to_profile(row: dict) -> UserProfile:
    return UserProfile(
        id           = row["id"],
        username     = row["username"],
        full_name    = row.get("full_name"),
        profession   = row["profession"],
        organization = row.get("organization"),
        department   = row.get("department"),
        bio          = row.get("bio"),
        avatar_url   = row.get("avatar_url"),
        website_url  = row.get("website_url"),
        is_verified  = row.get("is_verified", False),
        created_at   = row["created_at"],
    )


# ─────────────────────────────────────────────
# AuthService
# ─────────────────────────────────────────────

class AuthService:

    # ── Sign-up ──────────────────────────────

    async def sign_up(self, data: SignupRequest) -> AuthResponse:
        """
        Register a new user.
        1. Check username uniqueness.
        2. Create Supabase Auth user (with metadata).
        3. The DB trigger auto-inserts into public.profiles.
        4. Return tokens + profile.
        """
        # 1. Username uniqueness check
        if not await self.is_username_available(data.username):
            raise ValueError("Username is already taken.")

        # 2. Supabase Auth sign-up — metadata is written to profiles via trigger
        resp = supabase.auth.sign_up(
            {
                "email":    data.email,
                "password": data.password,
                "options": {
                    "data": {
                        "username":     data.username,
                        "full_name":    data.full_name,
                        "profession":   data.profession.value,
                        "organization": data.organization or "",
                        "department":   data.department or "",
                    }
                },
            }
        )

        if resp.user is None:
            raise ValueError("Signup failed. Please try again.")

        session = resp.session
        profile = await self.get_profile_by_id(resp.user.id)

        return AuthResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user=profile,
        )

    # ── Sign-in ──────────────────────────────

    async def sign_in(self, data: LoginRequest) -> AuthResponse:
        """Authenticate with email + password."""
        try:
            resp = supabase.auth.sign_in_with_password(
                {"email": data.email, "password": data.password}
            )
        except Exception:
            raise ValueError("Invalid email or password.")

        if resp.user is None:
            raise ValueError("Invalid email or password.")

        profile = await self.get_profile_by_id(resp.user.id)

        return AuthResponse(
            access_token=resp.session.access_token,
            refresh_token=resp.session.refresh_token,
            user=profile,
        )

    # ── Sign-out ─────────────────────────────

    async def sign_out(self) -> None:
        supabase.auth.sign_out()

    # ── Token management ─────────────────────

    async def verify_token(self, token: str) -> dict:
        """
        Verify a JWT access token.
        Returns {"user_id": ..., "email": ...} on success.
        Raises ValueError on failure.
        """
        try:
            resp = supabase.auth.get_user(token)
        except Exception:
            raise ValueError("Token is invalid or expired.")

        if resp.user is None:
            raise ValueError("Token is invalid or expired.")

        return {"user_id": resp.user.id, "email": resp.user.email}

    async def refresh_tokens(self, refresh_token: str) -> TokenRefreshResponse:
        """Exchange a refresh token for a new access/refresh pair."""
        try:
            resp = supabase.auth.refresh_session(refresh_token)
        except Exception:
            raise ValueError("Refresh token is invalid or expired.")

        if resp.session is None:
            raise ValueError("Refresh token is invalid or expired.")

        return TokenRefreshResponse(
            access_token=resp.session.access_token,
            refresh_token=resp.session.refresh_token,
        )

    # ── Profile CRUD ─────────────────────────

    async def get_profile_by_id(self, user_id: str) -> UserProfile:
        result = (
            supabase_admin.table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if not result.data:
            raise ValueError("Profile not found.")
        return _row_to_profile(result.data)

    async def get_profile_by_username(self, username: str) -> UserProfile:
        result = (
            supabase_admin.table("profiles")
            .select("*")
            .eq("username", username.lower())
            .single()
            .execute()
        )
        if not result.data:
            raise ValueError(f"User '{username}' not found.")
        return _row_to_profile(result.data)

    async def update_profile(self, user_id: str, data: ProfileUpdate) -> UserProfile:
        """Patch the profile — only update provided fields."""
        update_payload = {k: v for k, v in data.dict().items() if v is not None}
        if not update_payload:
            return await self.get_profile_by_id(user_id)

        supabase_admin.table("profiles").update(update_payload).eq("id", user_id).execute()
        return await self.get_profile_by_id(user_id)

    # ── Username availability ─────────────────

    async def is_username_available(self, username: str) -> bool:
        """Returns True if the username is not yet taken."""
        result = (
            supabase_admin.table("profiles")
            .select("username")
            .eq("username", username.lower())
            .maybe_single()
            .execute()
        )
        return result.data is None


# Singleton — import this everywhere
auth_service = AuthService()