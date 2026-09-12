import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.core.exceptions import GeopointException
from app.core.security import hash_password
from app.dependencies.db import get_db
from app.dependencies.rbac import require_super_admin
from app.models.user import User, UserRole, UserStatus
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.user_repository import UserRepository
from app.repositories.audit_repository import AuditLogRepository
from app.schemas.admin import (
    AdminCreate,
    AdminStatusUpdate,
    AdminResponse,
    AdminListResponse,
)
from app.schemas.audit_log import AuditLogListResponse, AuditLogResponse
from app.schemas.auth import MessageResponse
from app.services.email_service import EmailService

router = APIRouter()


def _build_admin_response(admin: User) -> AdminResponse:
    org_name = admin.organization.name if admin.organization else None
    org_code = admin.organization.code if admin.organization else None
    return AdminResponse(
        id=admin.id,
        organization_id=admin.organization_id,
        organization_name=org_name,
        organization_code=org_code,
        email=admin.email,
        full_name=admin.full_name,
        role=admin.role,
        status=admin.status,
        created_at=admin.created_at,
        updated_at=admin.updated_at,
    )


@router.post("/organizations/{org_id}/admins", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_organization_admin(
    org_id: uuid.UUID,
    payload: AdminCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    org_repo = OrganizationRepository(db)
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)

    # Concurrency-safe organization row locking
    org = org_repo.get_by_id_locked(org_id)
    if not org:
        raise GeopointException("Organization not found.", "ORG_NOT_FOUND", 404)

    # Enforce admin quota
    current_admins = org_repo.count_admins(org_id)
    if current_admins >= org.max_admins:
        raise GeopointException(
            f"Admin quota reached ({current_admins}/{org.max_admins}). Increase max_admins first.",
            "ADMIN_QUOTA_EXCEEDED",
            403,
        )

    # Check unique email
    if user_repo.get_by_email(payload.email):
        raise GeopointException("User with this email already exists.", "EMAIL_EXISTS", 409)

    new_admin = User(
        organization_id=org.id,
        email=payload.email.strip().lower(),
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        role=UserRole.ATTENDANCE_ADMIN,
        status=UserStatus.ACTIVE,
    )
    created_admin = user_repo.create(new_admin)

    # Log audit event
    audit_repo.log_event(
        action="CREATE_ADMIN",
        entity_type="ADMIN",
        entity_id=str(created_admin.id),
        organization_id=org.id,
        actor_user_id=current_user.id,
        new_values={"email": created_admin.email, "full_name": created_admin.full_name},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    # Dispatch credentials email
    EmailService.send_admin_credentials_email(
        recipient_email=created_admin.email,
        full_name=created_admin.full_name,
        organization_name=org.name,
        temp_password=payload.password,
    )

    return _build_admin_response(created_admin)


@router.get("/organizations/{org_id}/admins", response_model=list[AdminResponse])
def list_organization_admins(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    org_repo = OrganizationRepository(db)
    user_repo = UserRepository(db)
    if not org_repo.get_by_id(org_id):
        raise GeopointException("Organization not found.", "ORG_NOT_FOUND", 404)
    admins = user_repo.list_admins_by_org(org_id)
    return [_build_admin_response(admin) for admin in admins]


@router.get("/platform/admins", response_model=AdminListResponse)
def list_platform_admins(
    search: Optional[str] = Query(None),
    org_id: Optional[uuid.UUID] = Query(None),
    status: Optional[UserStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    user_repo = UserRepository(db)
    skip = (page - 1) * page_size
    items, total = user_repo.list_platform_admins(
        search=search, org_id=org_id, status=status, skip=skip, limit=page_size
    )
    return AdminListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[_build_admin_response(admin) for admin in items],
    )


@router.put("/platform/admins/{admin_id}/status", response_model=AdminResponse)
def update_admin_status(
    admin_id: uuid.UUID,
    payload: AdminStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)
    admin = user_repo.get_by_id(admin_id)
    if not admin or admin.role != UserRole.ATTENDANCE_ADMIN:
        raise GeopointException("Admin not found.", "ADMIN_NOT_FOUND", 404)

    old_status = str(admin.status)
    updated_admin = user_repo.update_status(admin, payload.status)
    action = "ACTIVATE_ADMIN" if payload.status == UserStatus.ACTIVE else "DEACTIVATE_ADMIN"

    audit_repo.log_event(
        action=action,
        entity_type="ADMIN",
        entity_id=str(updated_admin.id),
        organization_id=updated_admin.organization_id,
        actor_user_id=current_user.id,
        old_values={"status": old_status},
        new_values={"status": str(updated_admin.status)},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return _build_admin_response(updated_admin)


@router.delete("/platform/admins/{admin_id}", response_model=MessageResponse)
def delete_admin(
    admin_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    user_repo = UserRepository(db)
    audit_repo = AuditLogRepository(db)
    admin = user_repo.get_by_id(admin_id)
    if not admin or admin.role != UserRole.ATTENDANCE_ADMIN:
        raise GeopointException("Admin not found.", "ADMIN_NOT_FOUND", 404)

    audit_repo.log_event(
        action="DELETE_ADMIN",
        entity_type="ADMIN",
        entity_id=str(admin.id),
        organization_id=admin.organization_id,
        actor_user_id=current_user.id,
        old_values={"email": admin.email, "full_name": admin.full_name},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    user_repo.delete(admin)
    return MessageResponse(message=f"Admin '{admin.full_name}' successfully removed.")


@router.get("/platform/audit-logs", response_model=AuditLogListResponse)
def list_platform_audit_logs(
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    audit_repo = AuditLogRepository(db)
    skip = (page - 1) * page_size
    items, total = audit_repo.list_logs(
        organization_id=None, action=action, entity_type=entity_type, skip=skip, limit=page_size
    )
    response_items = [
        AuditLogResponse(
            id=log.id,
            organization_id=log.organization_id,
            actor_user_id=log.actor_user_id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            old_values=log.old_values,
            new_values=log.new_values,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            created_at=log.created_at,
        )
        for log in items
    ]
    return AuditLogListResponse(total=total, page=page, page_size=page_size, items=response_items)
