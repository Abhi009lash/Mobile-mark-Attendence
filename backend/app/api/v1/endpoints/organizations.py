import secrets
import string
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.employee import Employee
from app.models.branch import Branch
from app.models.attendance import Attendance
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    PlatformAnalyticsOverview,
)
from app.services.email_service import EmailService
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/analytics/overview", response_model=PlatformAnalyticsOverview)
def get_platform_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value))
):
    """Super Admin: Platform-wide analytics metrics."""
    total_orgs = db.query(Organization).count()
    active_orgs = db.query(Organization).filter(Organization.status == "active").count()
    suspended_orgs = db.query(Organization).filter(Organization.status == "suspended").count()
    total_users = db.query(User).count()
    total_employees = db.query(Employee).count()
    total_branches = db.query(Branch).count()
    today_punches = db.query(Attendance).filter(Attendance.date == date.today()).count()

    return {
        "total_organizations": total_orgs,
        "active_organizations": active_orgs,
        "suspended_organizations": suspended_orgs,
        "total_users": total_users,
        "total_employees": total_employees,
        "total_branches": total_branches,
        "today_punches": today_punches,
    }


@router.get("", response_model=List[OrganizationResponse])
def list_organizations(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value))
):
    """Super Admin: List and search all customer tenant organizations."""
    query = db.query(Organization)
    if search:
        query = query.filter(Organization.name.ilike(f"%{search}%") | Organization.email.ilike(f"%{search}%"))
    if status_filter:
        query = query.filter(Organization.status == status_filter)
    return query.order_by(Organization.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value))
):
    """Super Admin: Create a new customer organization and dispatch welcome credentials email."""
    repo = OrganizationRepository(db)
    existing = repo.get_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Organization with this email already exists.")

    new_org = repo.create(data.model_dump())

    # Generate temporary password for Org Owner
    chars = string.ascii_letters + string.digits + "!@#$%"
    temp_password = "".join(secrets.choice(chars) for _ in range(12))

    # Auto-create Organization Owner user
    user_repo = UserRepository(db)
    user_repo.create({
        "organization_id": new_org.id,
        "email": data.email,
        "name": f"{data.name} Admin",
        "password_hash": get_password_hash(temp_password),
        "role": UserRole.ORGANIZATION_OWNER.value,
        "status": "active"
    })

    # Dispatch SMTP Welcome Credentials Email
    EmailService.send_organization_credentials(
        org_name=new_org.name,
        org_email=new_org.email,
        admin_email=data.email,
        temporary_password=temp_password
    )

    return new_org


@router.get("/current", response_model=OrganizationResponse)
def get_my_organization(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    """Get organization details of authenticated tenant."""
    repo = OrganizationRepository(db)
    org = repo.get(tenant_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return org


@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization_by_id(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value))
):
    """Super Admin: Get single organization by ID."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return org


@router.put("/{org_id}", response_model=OrganizationResponse)
def update_organization(
    org_id: int,
    data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value, UserRole.ORGANIZATION_OWNER.value))
):
    """Super Admin or Org Owner: Update organization details, status, or user limit."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    repo = OrganizationRepository(db)
    return repo.update(org, data.model_dump(exclude_unset=True))


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value))
):
    """Super Admin: Delete organization and its cascade resources."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    db.delete(org)
    db.commit()
