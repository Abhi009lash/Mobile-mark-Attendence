from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.dependencies.db import get_db

router = APIRouter()


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="System and Database Health Check",
)
def check_health(db: Session = Depends(get_db)):
    """
    Verifies that the API service is running and can execute queries on PostgreSQL.
    """
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
    }
