from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import (
    GeopointException,
    geopoint_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Geopoint Enterprise Multi-Tenant Attendance & Workforce Management API",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
    )

    # CORS Middleware
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Global Exception Handlers
    app.add_exception_handler(GeopointException, geopoint_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    # Mount API Routers
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Mount Static Files Directory for Uploads (logos, media)
    import os
    from starlette.staticfiles import StaticFiles
    os.makedirs(os.path.join(settings.STATIC_DIR, "uploads", "logos"), exist_ok=True)
    app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

    @app.get("/", tags=["Root"])
    def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": "1.0.0",
            "docs": f"{settings.API_V1_STR}/docs",
            "health": f"{settings.API_V1_STR}/health",
        }

    @app.get("/docs", include_in_schema=False)
    def docs_redirect():
        return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

    @app.get("/redoc", include_in_schema=False)
    def redoc_redirect():
        return RedirectResponse(url=f"{settings.API_V1_STR}/redoc")

    return app


app = create_app()
