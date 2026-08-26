from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.policy import AttendancePolicy
from app.schemas.policy import AttendancePolicyCreate, AttendancePolicyUpdate, AttendancePolicyResponse

router = APIRouter()


@router.get("", response_model=AttendancePolicyResponse)
def get_attendance_policy(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user)
):
    """Get the organization attendance policy (start time, late threshold, etc.)."""
    policy = db.query(AttendancePolicy).filter(
        AttendancePolicy.organization_id == tenant_id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Attendance policy not configured for this organization.")
    return policy


@router.post("", response_model=AttendancePolicyResponse)
def set_attendance_policy(
    data: AttendancePolicyCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """Configure or update organization attendance policy."""
    policy = db.query(AttendancePolicy).filter(
        AttendancePolicy.organization_id == tenant_id
    ).first()

    if policy:
        for k, v in data.model_dump().items():
            setattr(policy, k, v)
    else:
        policy = AttendancePolicy(
            organization_id=tenant_id,
            **data.model_dump()
        )
        db.add(policy)

    db.commit()
    db.refresh(policy)
    return policy
