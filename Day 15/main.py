import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from alerting import report_critical_error
from config import get_cors_origins
from database import SessionLocal, get_db
from health import HealthResponse, LiveResponse, build_health_response
from observability import configure_observability
from routes.auth import router as auth_router
from routes.comments import router as comments_router
from routes.tasks import router as tasks_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("application started", extra={"event": "app.startup"})
    with SessionLocal() as session:
        startup_health = build_health_response(session)
        if startup_health.status != "healthy":
            database = startup_health.checks["database"]
            report_critical_error(
                "database unavailable at startup",
                event="app.startup.database_unavailable",
                database_status=database.status,
                database_detail=database.detail,
            )
    yield
    logger.info("application stopped", extra={"event": "app.shutdown"})


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
configure_observability(app)

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(comments_router)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.get("/live", response_model=LiveResponse)
def liveness():
    return LiveResponse(status="ok")


@app.get("/ready", response_model=HealthResponse)
def readiness(db: Session = Depends(get_db)):
    health = build_health_response(db)
    if health.status != "healthy":
        raise HTTPException(status_code=503, detail=health.model_dump())
    return health


@app.get("/health", response_model=LiveResponse)
def health():
    return LiveResponse(status="ok")


@app.websocket("/ws/echo")
async def ws_echo(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        pass
