from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserResponse, PushTokenUpdate
from app.services.email_service import EmailService

router = APIRouter()


@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value,
        UserRole.ATTENDANCE_ADMIN.value,
        UserRole.BRANCH_MANAGER.value
    ))
):
    """List users within the authenticated organization."""
    repo = UserRepository(db)
    return repo.list_by_org(organization_id=tenant_id, skip=skip, limit=limit)


@router.post("", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """
    Create a new user within the organization and dispatch account credentials email.
    """
    repo = UserRepository(db)
    existing = repo.get_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    user_dict = data.model_dump()
    raw_password = user_dict.pop("password")
    user_dict["password_hash"] = get_password_hash(raw_password)
    user_dict["organization_id"] = tenant_id

    created_user = repo.create(user_dict)

    # Get Organization Name
    org = db.query(Organization).filter(Organization.id == tenant_id).first()
    org_name = org.name if org else "Your Organization"

    # Dispatch Onboarding Email with credentials
    EmailService.send_user_account_created_email(
        user_name=created_user.name,
        user_email=created_user.email,
        role=created_user.role,
        temporary_password=raw_password,
        organization_name=org_name
    )

    return created_user


@router.post("/me/push-token", response_model=UserResponse)
def register_push_token(
    data: PushTokenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Register or update the mobile device's native Expo/FCM push token for system status-bar alerts.
    """
    current_user.push_token = data.push_token
    db.commit()
    db.refresh(current_user)
    return current_user
