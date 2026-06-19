from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Text,
    Enum
)
from sqlalchemy.sql import func
import uuid

from config.postgres_db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    full_name = Column(String)

    profession = Column(String)

    organization = Column(String)

    department = Column(String)

    bio = Column(Text)

    avatar_url = Column(String)

    website_url = Column(String)

    is_verified = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


