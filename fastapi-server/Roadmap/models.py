from config.postgres_db import Base
from sqlalchemy import (Column,Integer,String,Float,Text,DateTime)
from sqlalchemy.sql import func

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    abstract = Column(Text)

    year = Column(Integer)
    novelty = Column(Float)

    prediction = Column(String)
    probability = Column(Float)
    confidence = Column(String)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )