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

from pydantic import BaseModel, EmailStr, validator, Field


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
    email:        EmailStr
    password:     str        = Field(..., min_length=8, max_length=128)
    username:     str        = Field(..., min_length=3, max_length=50)
    full_name:    str        = Field(..., min_length=2, max_length=150)
    profession:   ProfessionType
    organization: Optional[str] = Field(None, max_length=250)
    department:   Optional[str] = Field(None, max_length=250)

    @validator("username")
    def validate_username(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username may only contain letters, numbers, and underscores.")
        return v.lower()

    @validator("password")
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit.")
        return v

    class Config:
        schema_extra = {
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


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

    class Config:
        schema_extra = {
            "example": {
                "email": "ada@university.edu",
                "password": "Secure123",
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

    class Config:
        orm_mode = True


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