from typing import Callable
from fastapi import Depends
from app.core.exceptions import GeopointException
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole


def require_role(*allowed_roles: UserRole) -> Callable[[User], User]:
    """Dependency factory that enforces that current_user has one of the allowed roles."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise GeopointException(
                message=f"Access forbidden. Requires one of roles: {[r.value for r in allowed_roles]}",
                code="FORBIDDEN",
                status_code=403,
            )
        return current_user

    return role_checker


require_super_admin = require_role(UserRole.SUPER_ADMIN)
require_attendance_admin = require_role(UserRole.ATTENDANCE_ADMIN)
require_admin_or_super_admin = require_role(UserRole.SUPER_ADMIN, UserRole.ATTENDANCE_ADMIN)
