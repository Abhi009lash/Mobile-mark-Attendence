from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse

router = APIRouter()


@router.get("", response_model=List[AuditLogResponse])
def list_audit_logs(
    entity: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """
    Organization Owner & HR Admin: View immutable system audit trail.
    """
    query = db.query(AuditLog).filter(AuditLog.organization_id == tenant_id)
    if entity:
        query = query.filter(AuditLog.entity == entity)
    return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
