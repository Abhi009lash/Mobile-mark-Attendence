import os
import pytest
from datetime import time
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment
os.environ["ENVIRONMENT"] = "testing"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "15"
os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = "90"

from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.employee import Employee
from app.models.branch import Branch
from app.models.location import Location
from app.models.policy import AttendancePolicy

# In-memory SQLite for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seed_test_data(db):
    # Create Test Organization 1
    org1 = Organization(name="Acme Corp", email="contact@acme.com", phone="1234567890", status="active")
    db.add(org1)
    db.flush()

    # Create Org 1 Policy (09:00 start, 15 min late threshold)
    policy1 = AttendancePolicy(
        organization_id=org1.id,
        working_start_time=time(9, 0, 0),
        working_end_time=time(18, 0, 0),
        late_threshold=15,
        overtime_enabled=True
    )
    db.add(policy1)

    # Create Org 1 Branch
    branch1 = Branch(
        organization_id=org1.id,
        name="Headquarters",
        address="123 Tech Park, Bangalore",
        latitude=12.9716,
        longitude=77.5946,
        status="active"
    )
    db.add(branch1)
    db.flush()

    # Create Org 1 Location (HQ Office, 100m radius)
    loc1 = Location(
        organization_id=org1.id,
        branch_id=branch1.id,
        name="Main Gate HQ",
        latitude=12.9716,
        longitude=77.5946,
        radius=100.0,
        status="active"
    )
    db.add(loc1)

    # Create Admin User
    admin_user = User(
        organization_id=org1.id,
        name="Acme Admin",
        email="admin@acme.com",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.ORGANIZATION_OWNER.value,
        status="active"
    )
    db.add(admin_user)

    # Create Employee User
    emp_user = User(
        organization_id=org1.id,
        branch_id=branch1.id,
        name="John Doe",
        email="john@acme.com",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.EMPLOYEE.value,
        status="active"
    )
    db.add(emp_user)
    db.flush()

    # Create Employee Profile
    employee = Employee(
        organization_id=org1.id,
        user_id=emp_user.id,
        branch_id=branch1.id,
        employee_code="EMP001",
        designation="Software Engineer",
        status="active"
    )
    db.add(employee)

    # Create Test Organization 2 (for tenant isolation tests)
    org2 = Organization(name="Beta LLC", email="contact@beta.com", phone="0987654321", status="active")
    db.add(org2)
    db.flush()

    emp_user2 = User(
        organization_id=org2.id,
        name="Jane Smith",
        email="jane@beta.com",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.EMPLOYEE.value,
        status="active"
    )
    db.add(emp_user2)
    db.flush()

    emp2 = Employee(
        organization_id=org2.id,
        user_id=emp_user2.id,
        employee_code="EMP002",
        designation="Product Manager",
        status="active"
    )
    db.add(emp2)

    db.commit()

    return {
        "org1": org1,
        "org2": org2,
        "admin_user": admin_user,
        "emp_user": emp_user,
        "employee": employee,
        "branch1": branch1,
        "loc1": loc1,
        "emp_user2": emp_user2,
    }
