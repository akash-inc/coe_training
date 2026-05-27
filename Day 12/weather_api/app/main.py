from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import UserPreference
from app.services.cache import CacheService, CacheServiceError
from app.services.weather import CityNotFoundError, UpstreamServiceError, WeatherService

app = FastAPI(title="Weather Dashboard API")
Base.metadata.create_all(bind=engine)


class WeatherResponse(BaseModel):
    city: str
    temperature: float
    condition: str
    units: str
    observed_at: str
    source: str


class UserPreferenceIn(BaseModel):
    user_id: int = Field(ge=1)
    preferred_city: str = Field(min_length=1, max_length=128)
    units: str = Field(default="metric", pattern="^(metric|imperial)$")


class UserPreferenceOut(BaseModel):
    user_id: int
    preferred_city: str
    units: str


def get_weather_service() -> WeatherService:
    return WeatherService()


def get_cache_service() -> CacheService:
    return CacheService()


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/weather", response_model=WeatherResponse)
def read_weather(
    city: str = Query(min_length=1),
    units: str = Query(default="metric", pattern="^(metric|imperial)$"),
    weather_service: WeatherService = Depends(get_weather_service),
    cache_service: CacheService = Depends(get_cache_service),
):
    cache_key = f"weather:{city.lower()}:{units}"
    try:
        cached_payload = cache_service.get(cache_key)
    except CacheServiceError:
        cached_payload = None

    if cached_payload is not None:
        return {**cached_payload, "source": "cache"}

    try:
        payload = weather_service.get_current_weather(city=city, units=units)
    except CityNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except UpstreamServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    try:
        cache_service.set(cache_key, payload, ttl_seconds=300)
    except CacheServiceError:
        # Cache failures should not block serving fresh weather data.
        pass

    return {**payload, "source": "api"}


@app.put("/preferences", response_model=UserPreferenceOut)
def upsert_preferences(payload: UserPreferenceIn, db: Session = Depends(get_db)):
    try:
        preference = db.query(UserPreference).filter(UserPreference.user_id == payload.user_id).first()
        if preference is None:
            preference = UserPreference(
                user_id=payload.user_id,
                preferred_city=payload.preferred_city,
                units=payload.units,
            )
            db.add(preference)
        else:
            preference.preferred_city = payload.preferred_city
            preference.units = payload.units

        db.commit()
        db.refresh(preference)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="Failed to store preference due to integrity conflict") from error
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while storing preference") from error

    return UserPreferenceOut(
        user_id=preference.user_id,
        preferred_city=preference.preferred_city,
        units=preference.units,
    )


@app.get("/preferences/{user_id}", response_model=UserPreferenceOut)
def get_preferences(user_id: int, db: Session = Depends(get_db)):
    try:
        preference = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    except SQLAlchemyError as error:
        raise HTTPException(status_code=500, detail="Database error while fetching preference") from error

    if preference is None:
        raise HTTPException(status_code=404, detail="Preferences not found")

    return UserPreferenceOut(
        user_id=preference.user_id,
        preferred_city=preference.preferred_city,
        units=preference.units,
    )
