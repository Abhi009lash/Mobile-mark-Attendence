import logging
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.subscription import Plan

logger = logging.getLogger(__name__)

SUPERADMIN_EMAIL = "superadmin@example.com"
SUPERADMIN_PASSWORD = "superpassword123"


def init_superadmin(db: Session) -> User:
    """
    Ensure the universal Super Admin account exists in the database.
    Email: superadmin@example.com
    Password: superpassword123
    Role: super_admin (Universal SaaS platform administrator)
    """
    user = db.query(User).filter(User.email == SUPERADMIN_EMAIL).first()
    if not user:
        logger.info(f"Seeding universal Super Admin account ({SUPERADMIN_EMAIL})...")
        user = User(
            email=SUPERADMIN_EMAIL,
            name="Platform Super Admin",
            password_hash=get_password_hash(SUPERADMIN_PASSWORD),
            role=UserRole.SUPER_ADMIN.value,
            organization_id=None,  # Universal platform-wide access
            branch_id=None,
            status="active"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Universal Super Admin account created successfully.")
    else:
        # Ensure credentials & role are in sync
        user.role = UserRole.SUPER_ADMIN.value
        user.status = "active"
        db.commit()
        db.refresh(user)

    return user


def init_default_plans(db: Session):
    """Seed default SaaS subscription plans if none exist."""
    existing_plans = db.query(Plan).count()
    if existing_plans == 0:
        logger.info("Seeding default subscription plans...")
        starter = Plan(
            name="Starter",
            max_employees=25,
            max_admins=2,
            max_locations=2,
            price=29.0,
            billing_cycle="monthly",
            status="active"
        )
        business = Plan(
            name="Business",
            max_employees=100,
            max_admins=10,
            max_locations=10,
            price=99.0,
            billing_cycle="monthly",
            status="active"
        )
        enterprise = Plan(
            name="Enterprise",
            max_employees=1000,
            max_admins=50,
            max_locations=50,
            price=299.0,
            billing_cycle="monthly",
            status="active"
        )
        db.add_all([starter, business, enterprise])
        db.commit()


def init_db(db: Session):
    """Initialize essential seed data."""
    init_superadmin(db)
    init_default_plans(db)
