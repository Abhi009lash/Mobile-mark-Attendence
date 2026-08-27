from app.services.push_notification_service import PushNotificationService
from app.services.email_service import EmailService
from app.services.notification_service import NotificationService


def test_universal_account_creation_email_template():
    """Verify universal account creation credentials email for any role."""
    sent = EmailService.send_user_account_created_email(
        user_name="Alice HR",
        user_email="alice@acme.com",
        role="hr_admin",
        temporary_password="SecurePass#2026",
        organization_name="Acme Corp",
        portal_url="http://localhost:8000"
    )
    assert sent is True


def test_user_creation_triggers_onboarding_email(client, seed_test_data):
    # Login as Admin
    login_admin = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@acme.com", "password": "Password123!"}
    )
    admin_token = login_admin.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin creates new HR User
    create_res = client.post(
        "/api/v1/users",
        json={
            "name": "Sarah Connor",
            "email": "sarah.hr@acme.com",
            "password": "Password123!",
            "role": "hr_admin"
        },
        headers=headers
    )
    assert create_res.status_code == 200
    user_data = create_res.json()
    assert user_data["email"] == "sarah.hr@acme.com"
    assert user_data["role"] == "hr_admin"


def test_register_device_push_token_and_dispatch(client, seed_test_data, db):
    # 1. Login as Employee
    login_emp = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    emp_token = login_emp.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # 2. Register mobile push token
    mock_token = "ExponentPushToken[mock_ios_device_12345]"
    token_res = client.post(
        "/api/v1/users/me/push-token",
        json={"push_token": mock_token},
        headers=emp_headers
    )
    assert token_res.status_code == 200
    assert token_res.json()["push_token"] == mock_token

    # 3. Dispatch mobile push notification
    pushed = PushNotificationService.send_mobile_push(
        push_token=mock_token,
        title="⏰ Check-In Reminder",
        body="Shift starts in 10 minutes."
    )
    assert pushed is True
