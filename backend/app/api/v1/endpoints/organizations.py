import base64
import os
import re
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, Request, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import GeopointException
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import require_super_admin, require_attendance_admin
from app.models.organization import Organization, OrganizationStatus
from app.models.user import User
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.audit_repository import AuditLogRepository
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationLimitsUpdate,
    OrganizationResponse,
    OrganizationListResponse,
)
from app.schemas.auth import MessageResponse
from app.services.email_service import EmailService

router = APIRouter()


def _build_org_response(org: Organization, repo: OrganizationRepository) -> OrganizationResponse:
    res = OrganizationResponse.model_validate(org)
    res.current_admins = repo.count_admins(org.id)
    res.current_employees = repo.count_employees(org.id)
    return res


@router.post("/upload-logo", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_organization_logo(
    request: Request,
    file: Optional[UploadFile] = File(None),
    _: User = Depends(require_super_admin),
):
    upload_dir = os.path.join(settings.STATIC_DIR, "uploads", "logos")
    os.makedirs(upload_dir, exist_ok=True)

    content_type = request.headers.get("content-type", "")

    # 1. Handle JSON base64 payload (avoids React Native / Expo FormDataPart issues)
    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise GeopointException("Invalid JSON payload.", "INVALID_PAYLOAD", 400)

        raw_b64 = body.get("image_base64") or body.get("file")
        if not raw_b64:
            raise GeopointException("Missing image_base64 data.", "MISSING_DATA", 400)

        ext = ".png"
        if "," in raw_b64 and "data:" in raw_b64:
            header, raw_b64 = raw_b64.split(",", 1)
            if "image/jpeg" in header or "image/jpg" in header:
                ext = ".jpg"
            elif "image/webp" in header:
                ext = ".webp"
            elif "image/gif" in header:
                ext = ".gif"
            elif "image/svg" in header:
                ext = ".svg"
        else:
            filename = body.get("filename", "")
            if filename:
                parsed_ext = os.path.splitext(filename)[1]
                if parsed_ext:
                    ext = parsed_ext

        try:
            image_bytes = base64.b64decode(raw_b64)
        except Exception:
            raise GeopointException("Invalid base64 encoding.", "INVALID_BASE64", 400)

        unique_name = f"logo_{uuid.uuid4().hex[:12]}{ext}"
        file_path = os.path.join(upload_dir, unique_name)
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        return {"logo_url": f"/static/uploads/logos/{unique_name}"}

    # 2. Handle multipart/form-data payload
    if file is None:
        form = await request.form()
        file = form.get("file")  # type: ignore
        if not file or not hasattr(file, "file"):
            raise GeopointException("No file was uploaded.", "NO_FILE_UPLOADED", 400)

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"]
    if file.content_type and file.content_type not in allowed_types:
        raise GeopointException("Only JPEG, PNG, WebP, and SVG images are permitted.", "INVALID_IMAGE_TYPE", 400)

    ext = os.path.splitext(file.filename or "")[1] or ".png"
    unique_name = f"logo_{uuid.uuid4().hex[:12]}{ext}"
    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"logo_url": f"/static/uploads/logos/{unique_name}"}


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    repo = OrganizationRepository(db)
    audit_repo = AuditLogRepository(db)

    name = payload.name.strip()

    # Determine or auto-generate slug
    if payload.slug and payload.slug.strip():
        slug = payload.slug.strip().lower()
        if repo.get_by_slug(slug):
            raise GeopointException("Organization with this slug already exists.", "SLUG_EXISTS", 409)
    else:
        base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', name).strip('-').lower() or "org"
        slug = base_slug
        counter = 1
        while repo.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

    # Determine or auto-generate code
    if payload.code and payload.code.strip():
        code = payload.code.strip().upper()
        if repo.get_by_code(code):
            raise GeopointException("Organization with this code already exists.", "CODE_EXISTS", 409)
    else:
        words = [w for w in re.split(r'[^a-zA-Z0-9]+', name) if w]
        if len(words) >= 2:
            base_code = "".join(w[0] for w in words[:4]).upper()
        else:
            base_code = re.sub(r'[^a-zA-Z0-9]', '', name)[:4].upper() or "ORG"
        if len(base_code) < 2:
            base_code = (base_code + "ORG")[:4]
        code = base_code
        counter = 1
        while repo.get_by_code(code):
            code = f"{base_code}{counter:02d}"
            counter += 1

    org_data = payload.model_dump()
    org_data["name"] = name
    org_data["slug"] = slug
    org_data["code"] = code
    org_data["email"] = org_data["email"].strip().lower()
    if org_data.get("website"):
        org_data["website"] = org_data["website"].strip()
    if org_data.get("logo_url"):
        org_data["logo_url"] = org_data["logo_url"].strip()
    org_data["status"] = OrganizationStatus.ACTIVE
    org = Organization(**org_data)
    created_org = repo.create(org)

    # Log audit event
    audit_repo.log_event(
        action="CREATE_ORGANIZATION",
        entity_type="ORGANIZATION",
        entity_id=str(created_org.id),
        organization_id=created_org.id,
        actor_user_id=current_user.id,
        new_values=payload.model_dump(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    # Dispatch onboarding preview email
    EmailService.send_organization_onboarding_email(
        recipient_email=created_org.email,
        name=created_org.name,
        slug=created_org.slug,
        code=created_org.code,
        max_admins=created_org.max_admins,
        max_employees=created_org.max_employees,
    )

    return _build_org_response(created_org, repo)


@router.get("", response_model=OrganizationListResponse)
def list_organizations(
    search: Optional[str] = Query(None),
    status: Optional[OrganizationStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    repo = OrganizationRepository(db)
    skip = (page - 1) * page_size
    items, total = repo.list_all(search=search, status=status, skip=skip, limit=page_size)
    response_items = [_build_org_response(org, repo) for org in items]
    return OrganizationListResponse(total=total, page=page, page_size=page_size, items=response_items)


@router.get("/me", response_model=OrganizationResponse)
def get_my_organization(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_attendance_admin),
):
    if not current_user.organization_id:
        raise GeopointException("User does not belong to an organization.", "NO_ORGANIZATION", 400)
    repo = OrganizationRepository(db)
    org = repo.get_by_id(current_user.organization_id)
    if not org:
        raise GeopointException("Organization not found.", "ORG_NOT_FOUND", 404)
    return _build_org_response(org, repo)


@router.put("/me", response_model=OrganizationResponse)
def update_my_organization(
    payload: OrganizationUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_attendance_admin),
):
    if not current_user.organization_id:
        raise GeopointException("User does not belong to an organization.", "NO_ORGANIZATION", 400)
    repo = OrganizationRepository(db)
    audit_repo = AuditLogRepository(db)
    org = repo.get_by_id(current_user.organization_id)
    if not org:
        raise GeopointException("Organization not found.", "ORG_NOT_FOUND", 404)

    # Attendance Admin cannot change status or code
    update_data = payload.model_dump(exclude_unset=True, exclude={"status", "code"})
    old_values = {k: getattr(org, k) for k in update_data.keys() if hasattr(org, k)}
    for key, value in update_data.items():
        setattr(org, key, value)
    updated_org = repo.update(org)

    audit_repo.log_event(
        action="UPDATE_ORGANIZATION",
        entity_type="ORGANIZATION",
        entity_id=str(updated_org.id),
        organization_id=updated_org.id,
        actor_user_id=current_user.id,
        old_values=old_values,
        new_values=update_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return _build_org_response(updated_org, repo)


@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    repo = OrganizationRepository(db)
    org = repo.get_by_id(org_id)
    if not org:
        raise GeopointException("Organization not found.", "ORG_NOT_FOUND", 404)
    return _build_org_response(org, repo)


@router.put("/{org_id}", response_model=OrganizationResponse)
def update_organization(
    org_id: uuid.UUID,
    payload: OrganizationUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    repo = OrganizationRepository(db)
    audit_repo = AuditLogRepository(db)
    org = repo.get_by_id(org_id)
    if not org:
        raise GeopointException("Organization not found.", "ORG_NOT_FOUND", 404)

    update_data = payload.model_dump(exclude_unset=True)
    if "code" in update_data and update_data["code"] != org.code:
        if repo.get_by_code(update_data["code"]):
            raise GeopointException("Organization code already in use.", "CODE_EXISTS", 409)

    old_values = {k: getattr(org, k) for k in update_data.keys() if hasattr(org, k)}
    for key, value in update_data.items():
        setattr(org, key, value)
    updated_org = repo.update(org)

    audit_repo.log_event(
        action="UPDATE_ORGANIZATION",
        entity_type="ORGANIZATION",
        entity_id=str(updated_org.id),
        organization_id=updated_org.id,
        actor_user_id=current_user.id,
        old_values=old_values,
        new_values=update_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return _build_org_response(updated_org, repo)


@router.put("/{org_id}/limits", response_model=OrganizationResponse)
def update_organization_limits(
    org_id: uuid.UUID,
    payload: OrganizationLimitsUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    repo = OrganizationRepository(db)
    audit_repo = AuditLogRepository(db)
    org = repo.get_by_id_locked(org_id)
    if not org:
        raise GeopointException("Organization not found.", "ORG_NOT_FOUND", 404)

    old_values = {"max_admins": org.max_admins, "max_employees": org.max_employees}
    new_values = {}
    if payload.max_admins is not None:
        org.max_admins = payload.max_admins
        new_values["max_admins"] = payload.max_admins
    if payload.max_employees is not None:
        org.max_employees = payload.max_employees
        new_values["max_employees"] = payload.max_employees

    updated_org = repo.update(org)
    audit_repo.log_event(
        action="UPDATE_LIMITS",
        entity_type="LIMITS",
        entity_id=str(updated_org.id),
        organization_id=updated_org.id,
        actor_user_id=current_user.id,
        old_values=old_values,
        new_values=new_values,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return _build_org_response(updated_org, repo)


@router.delete("/{org_id}", response_model=MessageResponse)
def delete_organization(
    org_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    repo = OrganizationRepository(db)
    audit_repo = AuditLogRepository(db)
    org = repo.get_by_id(org_id)
    if not org:
        raise GeopointException("Organization not found.", "ORG_NOT_FOUND", 404)

    audit_repo.log_event(
        action="DELETE_ORGANIZATION",
        entity_type="ORGANIZATION",
        entity_id=str(org.id),
        organization_id=org.id,
        actor_user_id=current_user.id,
        old_values={"name": org.name, "slug": org.slug, "code": org.code},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    repo.delete(org)
    return MessageResponse(message=f"Organization '{org.name}' successfully deleted.")
