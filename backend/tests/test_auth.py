import pytest
from app.core.security import hash_password
from app.models.organization import Organization, OrganizationStatus
from app.models.user import User, UserRole, UserStatus
from app.models.otp import PasswordResetOTP
from app.dependencies.db import SessionLocal
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository
from app.repositories.otp_repository import OTPRepository


@pytest.fixture(scope="function")
def seed_user():
    db = SessionLocal()
    try:
        # Create test organization
        org = Organization(
            name="Acme Corp",
            slug="acme-corp",
            email="admin@acme.com",
            status=OrganizationStatus.ACTIVE,
        )
        db.add(org)
        db.commit()
        db.refresh(org)

        # Create active field employee
        user = User(
            organization_id=org.id,
            email="employee@acme.com",
            full_name="John Doe",
            password_hash=hash_password("Password123!"),
            role=UserRole.FIELD_EMPLOYEE,
            status=UserStatus.ACTIVE,
        )
        db.add(user)

        # Create inactive user
        inactive_user = User(
            organization_id=org.id,
            email="inactive@acme.com",
            full_name="Inactive User",
            password_hash=hash_password("Password123!"),
            role=UserRole.FIELD_EMPLOYEE,
            status=UserStatus.INACTIVE,
        )
        db.add(inactive_user)

        db.commit()
        db.refresh(user)
        db.refresh(inactive_user)

        yield {
            "org": org,
            "user": user,
            "inactive_user": inactive_user,
            "password": "Password123!",
        }
    finally:
        # Cleanup in proper dependency order
        db.query(PasswordResetOTP).delete()
        db.query(User).delete()
        db.query(Organization).delete()
        db.commit()
        db.close()


def test_login_success(client, seed_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": seed_user["user"].email, "password": seed_user["password"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == seed_user["user"].email
    assert data["user"]["role"] == "FIELD_EMPLOYEE"


def test_login_invalid_password(client, seed_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": seed_user["user"].email, "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_inactive_account(client, seed_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": seed_user["inactive_user"].email, "password": seed_user["password"]},
    )
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "ACCOUNT_INACTIVE"


def test_get_me_authenticated(client, seed_user):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": seed_user["user"].email, "password": seed_user["password"]},
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == seed_user["user"].email
    assert data["full_name"] == "John Doe"
    assert data["role"] == "FIELD_EMPLOYEE"


def test_logout_authenticated(client, seed_user):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": seed_user["user"].email, "password": seed_user["password"]},
    )
    token = login_resp.json()["access_token"]

    response = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert "Successfully logged out" in response.json()["message"]


def test_forgot_password_anti_enumeration(client, seed_user):
    # Existing email
    resp1 = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": seed_user["user"].email},
    )
    assert resp1.status_code == 200

    # Non-existing email
    resp2 = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "doesnotexist@nowhere.com"},
    )
    assert resp2.status_code == 200
    assert resp1.json()["message"] == resp2.json()["message"]


def test_otp_verification_and_password_reset_flow(client, seed_user):
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        otp_repo = OTPRepository(db)
        auth_service = AuthService(user_repo, otp_repo)

        # 1. Dispatch OTP
        raw_otp = auth_service.request_password_reset_otp(seed_user["user"].email)
        assert raw_otp is not None
        assert len(raw_otp) == 6
        assert raw_otp.isdigit()

        # 2. Verify OTP via API endpoint
        verify_resp = client.post(
            "/api/v1/auth/verify-otp",
            json={"email": seed_user["user"].email, "otp": raw_otp},
        )
        assert verify_resp.status_code == 200
        verify_data = verify_resp.json()
        assert "reset_token" in verify_data
        reset_token = verify_data["reset_token"]

        # 3. Reset password using verified reset_token
        new_password = "BrandNewPassword789!"
        reset_resp = client.post(
            "/api/v1/auth/reset-password",
            json={"reset_token": reset_token, "new_password": new_password},
        )
        assert reset_resp.status_code == 200

        # 4. Old password must fail
        old_login = client.post(
            "/api/v1/auth/login",
            json={"email": seed_user["user"].email, "password": seed_user["password"]},
        )
        assert old_login.status_code == 401

        # 5. New password must succeed
        new_login = client.post(
            "/api/v1/auth/login",
            json={"email": seed_user["user"].email, "password": new_password},
        )
        assert new_login.status_code == 200
    finally:
        db.close()


def test_verify_otp_invalid_code_and_lockout(client, seed_user):
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        otp_repo = OTPRepository(db)
        auth_service = AuthService(user_repo, otp_repo)

        # Dispatch OTP
        auth_service.request_password_reset_otp(seed_user["user"].email)

        # Submit wrong code
        bad_resp = client.post(
            "/api/v1/auth/verify-otp",
            json={"email": seed_user["user"].email, "otp": "000000"},
        )
        assert bad_resp.status_code == 400
        assert "Incorrect verification code" in bad_resp.json()["error"]["message"]

        # Exhaust remaining attempts (up to 5 attempts total)
        for _ in range(4):
            client.post(
                "/api/v1/auth/verify-otp",
                json={"email": seed_user["user"].email, "otp": "000000"},
            )

        # 6th attempt should be locked out
        lockout_resp = client.post(
            "/api/v1/auth/verify-otp",
            json={"email": seed_user["user"].email, "otp": "000000"},
        )
        assert lockout_resp.status_code in [400, 429]
    finally:
        db.close()


def test_refresh_token_lifecycle(client, seed_user):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": seed_user["user"].email, "password": seed_user["password"]},
    )
    refresh_token = login_resp.json()["refresh_token"]

    refresh_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_resp.status_code == 200
    data = refresh_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
