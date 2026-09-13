import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.core.security import create_access_token, hash_password
from app.models.organization import Organization, OrganizationStatus
from app.models.user import User, UserRole, UserStatus

client = TestClient(app)


@pytest.fixture(scope="function")
def dashboard_setup():
    db = SessionLocal()
    try:
        super_admin = db.query(User).filter(User.email == "dash_super_adm@platform.com").first()
        if not super_admin:
            super_admin = User(
                email="dash_super_adm@platform.com",
                full_name="Dashboard Super Admin",
                password_hash=hash_password("SuperSecret@123"),
                role=UserRole.SUPER_ADMIN,
                status=UserStatus.ACTIVE,
            )
            db.add(super_admin)
            db.commit()
            db.refresh(super_admin)

        token = create_access_token(subject=str(super_admin.id), org_id=None, role=UserRole.SUPER_ADMIN.value)
        return {
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"},
        }
    finally:
        db.close()


def test_get_dashboard_metrics_success(dashboard_setup):
    headers = dashboard_setup["headers"]
    response = client.get("/api/v1/platform/dashboard/metrics", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "kpis" in data
    assert "total_organizations" in data["kpis"]
    assert "total_admins" in data["kpis"]
    assert "total_employees" in data["kpis"]

    assert "organization_status" in data
    assert "active" in data["organization_status"]
    assert "trial" in data["organization_status"]
    assert "suspended" in data["organization_status"]

    assert "daily_trends" in data
    assert isinstance(data["daily_trends"], list)
    assert len(data["daily_trends"]) > 0


def test_get_dashboard_metrics_future_date_rejected(dashboard_setup):
    headers = dashboard_setup["headers"]
    # Attempting future year
    response = client.get("/api/v1/platform/dashboard/metrics?year=2099&month=1", headers=headers)
    assert response.status_code == 400
    assert "Future year" in response.json()["error"]["message"]
