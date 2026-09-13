from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, organizations, admins, dashboard

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(admins.router, tags=["Admins & Platform"])
api_router.include_router(dashboard.router, prefix="/platform/dashboard", tags=["Dashboard"])


