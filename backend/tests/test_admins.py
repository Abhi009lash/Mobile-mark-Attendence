import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.core.security import create_access_token, hash_password
from app.models.organization import Organization, OrganizationStatus
from app.models.user import User, UserRole, UserStatus
from app.models.audit_log import AuditLog

client = TestClient(app)


@pytest.fixture(scope="function")
def admin_setup():
    db = SessionLocal()
    try:
        # Create Super Admin
        super_admin = db.query(User).filter(User.email == "super_adm_test@platform.com").first()
        if not super_admin:
            super_admin = User(
                email="super_adm_test@platform.com",
                full_name="Super Admin Tester",
                password_hash=hash_password("SuperSecret@123"),
                role=UserRole.SUPER_ADMIN,
                status=UserStatus.ACTIVE,
            )
            db.add(super_admin)
            db.commit()
            db.refresh(super_admin)

        # Create Organization with max_admins = 1
        org = Organization(
            name="Zenith Corp",
            slug="zenith-corp",
            code="ZEN-01",
            email="contact@zenith.com",
            max_admins=1,
            max_employees=50,
            status=OrganizationStatus.ACTIVE,
        )
        db.add(org)
        db.commit()
        db.refresh(org)

        token = create_access_token(subject=str(super_admin.id), org_id=None, role=UserRole.SUPER_ADMIN.value)
        yield {"token": token, "org": org, "super_admin": super_admin}
    finally:
        db.query(AuditLog).delete()
        db.query(User).filter(
            User.email.in_(["super_adm_test@platform.com", "firstadmin@zenith.com", "secondadmin@zenith.com"])
        ).delete()
        db.query(Organization).filter(Organization.slug == "zenith-corp").delete()
        db.commit()
        db.close()


def test_create_admin_and_login_flow(admin_setup):
    token = admin_setup["token"]
    org = admin_setup["org"]

    # 1. Super Admin creates Admin
    payload = {
        "full_name": "Zenith Head Admin",
        "email": "firstadmin@zenith.com",
        "password": "InitialPassword@123",
    }
    res = client.post(f"/api/v1/organizations/{org.id}/admins", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "firstadmin@zenith.com"
    assert data["organization_id"] == str(org.id)
    assert data["status"] == "ACTIVE"

    # 2. Created admin directly signs in via POST /auth/login
    login_res = client.post("/api/v1/auth/login", json={"email": "firstadmin@zenith.com", "password": "InitialPassword@123"})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
    assert login_res.json()["user"]["role"] == "ATTENDANCE_ADMIN"


def test_admin_quota_exceeded(admin_setup):
    token = admin_setup["token"]
    org = admin_setup["org"]

    # 1st admin succeeds (max_admins = 1)
    res1 = client.post(
        f"/api/v1/organizations/{org.id}/admins",
        json={"full_name": "Admin One", "email": "firstadmin@zenith.com", "password": "Password123!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res1.status_code == 201

    # 2nd admin rejected with 403 Forbidden
    res2 = client.post(
        f"/api/v1/organizations/{org.id}/admins",
        json={"full_name": "Admin Two", "email": "secondadmin@zenith.com", "password": "Password123!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res2.status_code == 403
    assert "quota reached" in res2.json()["error"]["message"].lower()


def test_list_and_manage_admin_status(admin_setup):
    token = admin_setup["token"]
    org = admin_setup["org"]

    # Create admin
    res = client.post(
        f"/api/v1/organizations/{org.id}/admins",
        json={"full_name": "Status Admin", "email": "firstadmin@zenith.com", "password": "Password123!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    admin_id = res.json()["id"]

    # List org admins
    list_org = client.get(f"/api/v1/organizations/{org.id}/admins", headers={"Authorization": f"Bearer {token}"})
    assert list_org.status_code == 200
    assert len(list_org.json()) == 1

    # List platform admins
    list_plat = client.get("/api/v1/platform/admins?search=Status", headers={"Authorization": f"Bearer {token}"})
    assert list_plat.status_code == 200
    assert list_plat.json()["total"] >= 1

    # Deactivate admin
    res_deact = client.put(
        f"/api/v1/platform/admins/{admin_id}/status",
        json={"status": "INACTIVE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_deact.status_code == 200
    assert res_deact.json()["status"] == "INACTIVE"

    # Inactive admin cannot login
    bad_login = client.post("/api/v1/auth/login", json={"email": "firstadmin@zenith.com", "password": "Password123!"})
    assert bad_login.status_code == 403

    # Delete admin
    del_res = client.delete(f"/api/v1/platform/admins/{admin_id}", headers={"Authorization": f"Bearer {token}"})
    assert del_res.status_code == 200


def test_platform_audit_logs(admin_setup):
    token = admin_setup["token"]

    res = client.get("/api/v1/platform/audit-logs", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "total" in res.json()
    assert isinstance(res.json()["items"], list)
