import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, SessionLocal, Base, auto_migrate_schema
from app.core.redis import redis_service
from app.core.init_db import init_db
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist & auto-migrate new columns
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    auto_migrate_schema(engine)

    # Initialize universal Super Admin & default plans
    db = SessionLocal()
    try:
        init_db(db)
    except Exception as e:
        logger.error(f"Error initializing default database seeds: {e}")
    finally:
        db.close()

    logger.info(f"Database initialized. Redis connected: {redis_service.is_connected}")
    yield
    # Shutdown
    logger.info("Application shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    """Application and infrastructure health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "redis_connected": redis_service.is_connected,
        "access_token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "refresh_token_expire_days": settings.REFRESH_TOKEN_EXPIRE_DAYS,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)
