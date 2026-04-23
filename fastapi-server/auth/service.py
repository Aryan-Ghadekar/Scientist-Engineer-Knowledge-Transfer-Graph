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

logger = logging.getLogger("auth.service")
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# ─────────────────────────────────────────────
# Supabase clients
# ─────────────────────────────────────────────

_SUPABASE_URL         = os.environ["SUPABASE_URL"]
_SUPABASE_ANON_KEY    = os.environ["SUPABASE_ANON_KEY"]
_SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# Admin client — service role key, bypasses RLS, used for admin.create_user
supabase_admin: Client = create_client(_SUPABASE_URL, _SUPABASE_SERVICE_KEY)

# Anon client — used for sign_in_with_password to get a proper JWT session
supabase_anon: Client  = create_client(_SUPABASE_URL, _SUPABASE_ANON_KEY)


# ─────────────────────────────────────────────
# Helper
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


def _fetch_profile(user_id: str) -> UserProfile:
    """Fetch profile row by UUID — raises ValueError if not found."""
    try:
        result = (
            supabase_admin
            .table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
    except Exception as exc:
        logger.error("_fetch_profile DB error user_id=%s: %s", user_id, exc)
        raise ValueError(f"Profile not found (DB error: {exc})") from exc

    if not result.data:
        raise ValueError(f"Profile not found for user_id={user_id}")

    row = result.data if isinstance(result.data, dict) else result.data[0]
    logger.debug("_fetch_profile: found username=%s", row.get("username"))
    return _row_to_profile(row)


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
        logger.debug("sign_up: username=%s email=%s", data.username, data.email)

        # 1. Username check
        if not await self.is_username_available(data.username):
            raise ValueError("Username is already taken.")

        # 2. Create user via admin API — email_confirm=True skips confirmation email
        try:
            auth_res = supabase_admin.auth.admin.create_user({
                "email":          data.email,
                "password":       data.password,
                "email_confirm":  True,           # ← key: no confirmation email sent
                "user_metadata": {
                    "username":     data.username,
                    "full_name":    data.full_name,
                    "profession":   data.profession.value,
                    "organization": data.organization or "",
                    "department":   data.department or "",
                },
            })
        except Exception as exc:
            logger.error("admin.create_user failed:\n%s", traceback.format_exc())
            # Surface the real Supabase error (e.g. "User already registered")
            raise ValueError(f"Signup failed: {exc}") from exc

        user = auth_res.user
        if not user:
            raise ValueError("Signup failed — Supabase returned no user.")

        logger.debug("sign_up: user created id=%s, now signing in to get session", user.id)

        # 3. Sign in immediately to obtain JWT tokens
        try:
            session_res = supabase_anon.auth.sign_in_with_password({
                "email":    data.email,
                "password": data.password,
            })
        except Exception as exc:
            logger.error("post-signup sign_in failed:\n%s", traceback.format_exc())
            raise ValueError(
                "Account created but auto-login failed. Please log in manually."
            ) from exc

        if session_res.session is None or session_res.user is None:
            raise ValueError("Account created but auto-login failed. Please log in manually.")

        # 4. Fetch the auto-created profile (created by DB trigger)
        profile = _fetch_profile(user.id)

        logger.info("sign_up success: user_id=%s username=%s", user.id, data.username)

        return AuthResponse(
            access_token  = session_res.session.access_token,
            refresh_token = session_res.session.refresh_token,
            user          = profile,
        )

    # ── Sign-in ──────────────────────────────

    async def sign_in(self, data: LoginRequest) -> AuthResponse:
        logger.debug("sign_in: email=%s", data.email)
        try:
            resp = supabase_anon.auth.sign_in_with_password({
                "email":    data.email,
                "password": data.password,
            })
        except Exception as exc:
            logger.warning("sign_in failed email=%s: %s", data.email, exc)
            raise ValueError("Invalid email or password.") from exc

        if resp.user is None or resp.session is None:
            raise ValueError("Invalid email or password.")

        profile = _fetch_profile(resp.user.id)
        logger.info("sign_in success: user_id=%s", resp.user.id)

        return AuthResponse(
            access_token  = resp.session.access_token,
            refresh_token = resp.session.refresh_token,
            user          = profile,
        )

    # ── Sign-out ─────────────────────────────

    async def sign_out(self) -> None:
        try:
            supabase_anon.auth.sign_out()
        except Exception as exc:
            logger.warning("sign_out error (ignored): %s", exc)

    # ── Token verification ────────────────────

    async def verify_token(self, token: str) -> dict:
        logger.debug("verify_token: %.12s...", token)
        try:
            resp = supabase_admin.auth.get_user(token)
        except Exception as exc:
            logger.warning("verify_token failed: %s", exc)
            raise ValueError("Token is invalid or expired.") from exc

        if resp.user is None:
            raise ValueError("Token is invalid or expired.")

        return {"user_id": resp.user.id, "email": resp.user.email}

    # ── Token refresh ─────────────────────────

    async def refresh_tokens(self, refresh_token: str) -> TokenRefreshResponse:
        try:
            resp = supabase_anon.auth.refresh_session(refresh_token)
        except Exception as exc:
            raise ValueError("Refresh token is invalid or expired.") from exc

        if resp.session is None:
            raise ValueError("Refresh token is invalid or expired.")

        return TokenRefreshResponse(
            access_token  = resp.session.access_token,
            refresh_token = resp.session.refresh_token,
        )

    # ── Profile CRUD ──────────────────────────

    async def get_profile_by_id(self, user_id: str) -> UserProfile:
        return _fetch_profile(user_id)

    async def get_profile_by_username(self, username: str) -> UserProfile:
        try:
            result = (
                supabase_admin
                .table("profiles")
                .select("*")
                .eq("username", username.lower())
                .single()
                .execute()
            )
        except Exception as exc:
            raise ValueError(f"User '{username}' not found.") from exc

        if not result.data:
            raise ValueError(f"User '{username}' not found.")

        row = result.data if isinstance(result.data, dict) else result.data[0]
        return _row_to_profile(row)

    async def update_profile(self, user_id: str, data: ProfileUpdate) -> UserProfile:
        payload = {k: v for k, v in data.model_dump().items() if v is not None}
        if not payload:
            return _fetch_profile(user_id)

        try:
            supabase_admin.table("profiles").update(payload).eq("id", user_id).execute()
        except Exception as exc:
            raise ValueError(f"Profile update failed: {exc}") from exc

        return _fetch_profile(user_id)

    # ── Username availability ─────────────────

    async def is_username_available(self, username: str) -> bool:
        try:
            result = (
                supabase_admin
                .table("profiles")
                .select("username")
                .eq("username", username.lower())
                .limit(1)
                .execute()
            )
            available = len(result.data) == 0
            logger.debug("is_username_available '%s' → %s", username, available)
            return available
        except Exception as exc:
            logger.error("is_username_available error: %s", exc)
            return False


auth_service = AuthService()