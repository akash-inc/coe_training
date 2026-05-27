from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, unique=True, index=True, nullable=False)
    preferred_city: Mapped[str] = mapped_column(String(128), nullable=False)
    units: Mapped[str] = mapped_column(String(16), default="metric", nullable=False)
