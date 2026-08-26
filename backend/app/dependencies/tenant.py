from fastapi import Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole


def get_current_tenant_id(current_user: User = Depends(get_current_user)) -> int:
    """
    Enforces strict multi-tenancy.
    Extracts and guarantees the organization_id from the authenticated user.
    Never trusts tenant/organization ID provided as a client query param or header.
    """
    if current_user.role == UserRole.SUPER_ADMIN.value:
        # Super admins can view all or specify tenant if needed
        return current_user.organization_id or 0

    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not assigned to any organization tenant."
        )

    return current_user.organization_id
