from abc import ABC, abstractmethod
from typing import Optional

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import UserPreference


class PreferenceConflictError(Exception):
    """Raised when preference data violates DB integrity constraints."""


class PreferenceStorageError(Exception):
    """Raised for non-integrity persistence failures."""


class UserPreferenceRepository(ABC):
    @abstractmethod
    def upsert(self, user_id: int, preferred_city: str, units: str) -> UserPreference:
        """Create or update user preference."""

    @abstractmethod
    def get_by_user_id(self, user_id: int) -> Optional[UserPreference]:
        """Fetch preference by user id."""


class SqlAlchemyUserPreferenceRepository(UserPreferenceRepository):
    def __init__(self, db: Session):
        self.db = db

    def upsert(self, user_id: int, preferred_city: str, units: str) -> UserPreference:
        try:
            preference = (
                self.db.query(UserPreference)
                .filter(UserPreference.user_id == user_id)
                .first()
            )
            if preference is None:
                preference = UserPreference(
                    user_id=user_id,
                    preferred_city=preferred_city,
                    units=units,
                )
                self.db.add(preference)
            else:
                preference.preferred_city = preferred_city
                preference.units = units

            self.db.commit()
            self.db.refresh(preference)
            return preference
        except IntegrityError as error:
            self.db.rollback()
            raise PreferenceConflictError("Failed to store preference due to integrity conflict") from error
        except SQLAlchemyError as error:
            self.db.rollback()
            raise PreferenceStorageError("Database error while storing preference") from error

    def get_by_user_id(self, user_id: int) -> Optional[UserPreference]:
        try:
            return (
                self.db.query(UserPreference)
                .filter(UserPreference.user_id == user_id)
                .first()
            )
        except SQLAlchemyError as error:
            raise PreferenceStorageError("Database error while fetching preference") from error
