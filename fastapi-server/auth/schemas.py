"""
auth/models.py
Pydantic models for request validation, response serialization,
and DB representation. Keep all auth-related schemas here.
"""
from __future__ import annotations

import re
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator, Field, model_validator

# ─────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────

class ProfessionType(str, Enum):
    engineer   = "engineer"
    scientist  = "scientist"
    researcher = "researcher"
    student    = "student"
    professor  = "professor"
    other      = "other"


# ─────────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=150)
    profession: ProfessionType
    organization: Optional[str] = Field(None, max_length=250)
    department: Optional[str] = Field(None, max_length=250)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:

        if len(v.encode("utf-8")) > 72:
            raise ValueError(
                "Password must be 72 bytes or fewer."
            )

        if not re.search(r"[A-Z]", v):
            raise ValueError(
                "Password must contain at least one uppercase letter."
            )

        if not re.search(r"[0-9]", v):
            raise ValueError(
                "Password must contain at least one digit."
            )

        return v

    model_config = {                      # Pydantic V2: model_config dict replaces class Config
        "json_schema_extra": {            # renamed from schema_extra
            "example": {
                "email": "ada@university.edu",
                "password": "Secure123",
                "username": "ada_research",
                "full_name": "Ada Lovelace",
                "profession": "researcher",
                "organization": "MIT CSAIL",
                "department": "Machine Learning",
            }
        }
    }


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "ada@university.edu",
                "password": "Secure123",
            }
        }
    }


class RefreshRequest(BaseModel):
    refresh_token: str


class CheckUsernameRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)


# ─────────────────────────────────────────────
# PROFILE UPDATE
# ─────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    """All fields optional — patch semantics (PATCH /auth/me)."""
    full_name:    Optional[str]            = Field(None, max_length=150)
    profession:   Optional[ProfessionType] = None
    organization: Optional[str]            = Field(None, max_length=250)
    department:   Optional[str]            = Field(None, max_length=250)
    bio:          Optional[str]            = Field(None, max_length=1000)
    avatar_url:   Optional[str]            = None
    website_url:  Optional[str]            = None


# ─────────────────────────────────────────────
# RESPONSE MODELS
# ─────────────────────────────────────────────

class UserProfile(BaseModel):
    """Serialized profile returned to the client. Never expose sensitive fields."""
    id:           str
    username:     str
    full_name:    Optional[str]
    profession:   ProfessionType
    organization: Optional[str]
    department:   Optional[str]
    bio:          Optional[str]
    avatar_url:   Optional[str]
    website_url:  Optional[str]
    is_verified:  bool
    created_at:   datetime

    model_config = {
        "from_attributes": True           # Pydantic V2: renamed from orm_mode
    }


class AuthResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str        = "bearer"
    user:          UserProfile


class TokenRefreshResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"


class UsernameCheckResponse(BaseModel):
    username:  str
    available: bool


class MessageResponse(BaseModel):
    message: str
    success: bool = True