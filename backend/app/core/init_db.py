import logging
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.organization import Organization, OrganizationStatus
from app.models.user import User, UserRole, UserStatus

logger = logging.getLogger(__name__)

SUPERADMIN_EMAIL = "superadmin@example.com"
SUPERADMIN_PASSWORD = "Superpassword123"

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "Admin@123"

DEFAULT_ORG_NAME = "Geopoint Technologies"
DEFAULT_ORG_SLUG = "geopoint-technologies"


def init_db(db: Session) -> None:
    """
    Idempotently seeds the database with the standard built-in Super Admin,
    default Organization, and Attendance Admin.
    """
    # 1. Super Admin (Platform level, organization_id=None)
    super_admin = db.query(User).filter(User.email == SUPERADMIN_EMAIL).first()
    if not super_admin:
        super_admin = User(
            organization_id=None,
            email=SUPERADMIN_EMAIL,
            full_name="Super Administrator",
            password_hash=hash_password(SUPERADMIN_PASSWORD),
            role=UserRole.SUPER_ADMIN,
            status=UserStatus.ACTIVE,
        )
        db.add(super_admin)
        logger.info(f"Standard Super Admin created: {SUPERADMIN_EMAIL}")

    # 2. Standard Organization
    org = db.query(Organization).filter(Organization.slug == DEFAULT_ORG_SLUG).first()
    if not org:
        org = Organization(
            name=DEFAULT_ORG_NAME,
            slug=DEFAULT_ORG_SLUG,
            code="GEO-01",
            email=ADMIN_EMAIL,
            phone="+1-800-555-GEO",
            status=OrganizationStatus.ACTIVE,
        )
        db.add(org)
        db.flush()
        logger.info(f"Standard Organization created: {DEFAULT_ORG_NAME}")

    # 3. Attendance Admin (Organization level)
    admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            organization_id=org.id,
            email=ADMIN_EMAIL,
            full_name="Organization Administrator",
            password_hash=hash_password(ADMIN_PASSWORD),
            role=UserRole.ATTENDANCE_ADMIN,
            status=UserStatus.ACTIVE,
        )
        db.add(admin)
        logger.info(f"Standard Attendance Admin created: {ADMIN_EMAIL}")

    db.commit()
