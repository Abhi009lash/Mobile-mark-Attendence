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
def setup_data():
    db = SessionLocal()
    try:
        db.query(Organization).filter(
            (Organization.slug.in_(["apex-global", "delta-corp", "dup-slug"])) |
            (Organization.slug.like("zenith-horizon-global%"))
        ).delete()
        db.commit()

        # Create Super Admin
        super_admin = db.query(User).filter(User.email == "test_super@platform.com").first()
        if not super_admin:
            super_admin = User(
                email="test_super@platform.com",
                full_name="Platform Super Admin",
                password_hash=hash_password("SuperSecret@123"),
                role=UserRole.SUPER_ADMIN,
                status=UserStatus.ACTIVE,
            )
            db.add(super_admin)
            db.commit()
            db.refresh(super_admin)

        # Create Org & Org Admin
        org = Organization(
            name="Apex Global",
            slug="apex-global",
            code="APEX-01",
            email="contact@apex.com",
            max_admins=2,
            max_employees=75,
            status=OrganizationStatus.ACTIVE,
        )
        db.add(org)
        db.commit()
        db.refresh(org)

        org_admin = User(
            organization_id=org.id,
            email="admin@apex.com",
            full_name="Apex Admin",
            password_hash=hash_password("ApexAdmin@123"),
            role=UserRole.ATTENDANCE_ADMIN,
            status=UserStatus.ACTIVE,
        )
        db.add(org_admin)
        db.commit()
        db.refresh(org_admin)

        super_token = create_access_token(subject=str(super_admin.id), org_id=None, role=UserRole.SUPER_ADMIN.value)
        admin_token = create_access_token(subject=str(org_admin.id), org_id=str(org.id), role=UserRole.ATTENDANCE_ADMIN.value)

        yield {
            "super_token": super_token,
            "admin_token": admin_token,
            "org": org,
            "org_admin": org_admin,
            "super_admin": super_admin,
        }
    finally:
        db.query(AuditLog).delete()
        db.query(User).filter(User.email.in_(["test_super@platform.com", "admin@apex.com", "newadmin@apex.com"])).delete()
        db.query(Organization).filter(
            (Organization.slug.in_(["apex-global", "delta-corp", "dup-slug"])) |
            (Organization.slug.like("zenith-horizon-global%"))
        ).delete()
        db.commit()
        db.close()


def test_create_organization_success(setup_data):
    token = setup_data["super_token"]
    payload = {
        "name": "Delta Corp",
        "slug": "delta-corp",
        "code": "DELTA-01",
        "email": "info@deltacorp.com",
        "phone": "+91-9988776655",
        "city": "Hyderabad",
        "state": "Telangana",
        "max_admins": 3,
        "max_employees": 150,
    }
    response = client.post("/api/v1/organizations", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Delta Corp"
    assert data["code"] == "DELTA-01"
    assert data["max_admins"] == 3
    assert data["max_employees"] == 150
    assert data["current_admins"] == 0
    assert data["current_employees"] == 0


def test_create_organization_duplicate_rejected(setup_data):
    token = setup_data["super_token"]
    # Duplicate slug
    payload = {
        "name": "Apex Clone",
        "slug": "apex-global",
        "code": "DIFF-01",
        "email": "diff@clone.com",
    }
    res = client.post("/api/v1/organizations", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 409

    # Duplicate code
    payload2 = {
        "name": "Apex Code Dup",
        "slug": "dup-slug",
        "code": "APEX-01",
        "email": "diff2@clone.com",
    }
    res2 = client.post("/api/v1/organizations", json=payload2, headers={"Authorization": f"Bearer {token}"})
    assert res2.status_code == 409


def test_non_super_admin_cannot_create_organization(setup_data):
    admin_token = setup_data["admin_token"]
    payload = {"name": "Test", "slug": "test-org", "code": "TEST-01", "email": "t@t.com"}
    res = client.post("/api/v1/organizations", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 403


def test_list_and_get_organizations(setup_data):
    token = setup_data["super_token"]
    org = setup_data["org"]

    res = client.get("/api/v1/organizations", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["total"] >= 1

    res_single = client.get(f"/api/v1/organizations/{org.id}", headers={"Authorization": f"Bearer {token}"})
    assert res_single.status_code == 200
    assert res_single.json()["slug"] == org.slug


def test_update_organization_and_limits(setup_data):
    token = setup_data["super_token"]
    org = setup_data["org"]

    # Update profile
    res = client.put(
        f"/api/v1/organizations/{org.id}",
        json={"phone": "+91-1122334455", "city": "Bengaluru"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["city"] == "Bengaluru"

    # Update limits
    res_lim = client.put(
        f"/api/v1/organizations/{org.id}/limits",
        json={"max_admins": 5, "max_employees": 200},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_lim.status_code == 200
    assert res_lim.json()["max_admins"] == 5
    assert res_lim.json()["max_employees"] == 200


def test_attendance_admin_own_organization(setup_data):
    admin_token = setup_data["admin_token"]

    # Get own org
    res = client.get("/api/v1/organizations/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert res.json()["slug"] == "apex-global"

    # Update own org address
    res_up = client.put(
        "/api/v1/organizations/me",
        json={"address_line1": "Suite 404, Tech Tower", "city": "Pune"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_up.status_code == 200
    assert res_up.json()["city"] == "Pune"


def test_create_organization_with_website_and_auto_slug_code(setup_data):
    token = setup_data["super_token"]
    payload = {
        "name": "Zenith Horizon Global",
        "email": "contact@zenithhorizon.com",
        "website": "https://zenithhorizon.com",
        "logo_url": "https://zenithhorizon.com/logo.png",
        "max_admins": 4,
        "max_employees": 250,
    }
    res = client.post("/api/v1/organizations", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Zenith Horizon Global"
    assert data["slug"] == "zenith-horizon-global"
    assert data["code"] == "ZHG"
    assert data["website"] == "https://zenithhorizon.com"
    assert data["logo_url"] == "https://zenithhorizon.com/logo.png"
    assert data["max_admins"] == 4
    assert data["max_employees"] == 250


def test_upload_organization_logo(setup_data):
    token = setup_data["super_token"]
    file_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    files = {"file": ("test_logo.png", file_content, "image/png")}
    res = client.post("/api/v1/organizations/upload-logo", files=files, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert "logo_url" in data
    assert data["logo_url"].startswith("/static/uploads/logos/")

