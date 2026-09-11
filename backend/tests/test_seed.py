import pytest
from app.core.database import SessionLocal
from app.core.init_db import (
    init_db,
    SUPERADMIN_EMAIL,
    SUPERADMIN_PASSWORD,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
)


def test_seed_accounts_login_and_roles(client):
    db = SessionLocal()
    try:
        # Ensure seeded
        init_db(db)

        # 1. Verify Super Admin login
        super_resp = client.post(
            "/api/v1/auth/login",
            json={"email": SUPERADMIN_EMAIL, "password": SUPERADMIN_PASSWORD},
        )
        assert super_resp.status_code == 200, f"Super Admin login failed: {super_resp.text}"
        super_data = super_resp.json()
        assert super_data["user"]["email"] == SUPERADMIN_EMAIL
        assert super_data["user"]["role"] == "SUPER_ADMIN"
        assert super_data["user"]["organization_id"] is None
        assert "access_token" in super_data

        # 2. Verify Attendance Admin login
        admin_resp = client.post(
            "/api/v1/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        assert admin_resp.status_code == 200, f"Admin login failed: {admin_resp.text}"
        admin_data = admin_resp.json()
        assert admin_data["user"]["email"] == ADMIN_EMAIL
        assert admin_data["user"]["role"] == "ATTENDANCE_ADMIN"
        assert admin_data["user"]["organization_id"] is not None
        assert "access_token" in admin_data

        # 3. Verify idempotency
        init_db(db)
        # Verify logins still work after repeated seed calls
        recheck_resp = client.post(
            "/api/v1/auth/login",
            json={"email": SUPERADMIN_EMAIL, "password": SUPERADMIN_PASSWORD},
        )
        assert recheck_resp.status_code == 200
    finally:
        db.close()
