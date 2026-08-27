from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.holiday import Holiday
from app.schemas.holiday import HolidayCreate, HolidayResponse

router = APIRouter()


@router.get("", response_model=List[HolidayResponse])
def list_holidays(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user)
):
    """List organization-wide and branch-specific holidays."""
    query = db.query(Holiday).filter(Holiday.organization_id == tenant_id)
    if current_user.branch_id:
        query = query.filter(
            (Holiday.branch_id == current_user.branch_id) | (Holiday.branch_id.is_(None))
        )
    return query.order_by(Holiday.date.asc()).all()


@router.post("", response_model=HolidayResponse, status_code=status.HTTP_201_CREATED)
def create_holiday(
    data: HolidayCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """Add a holiday to the organization calendar."""
    holiday = Holiday(organization_id=tenant_id, **data.model_dump())
    db.add(holiday)
    db.commit()
    db.refresh(holiday)
    return holiday
