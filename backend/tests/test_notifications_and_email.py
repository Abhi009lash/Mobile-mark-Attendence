from app.services.email_service import EmailService
from app.services.notification_service import NotificationService
from app.models.notification import NotificationType, Notification


def test_smtp_organization_welcome_email():
    """Verify organization credentials email template generation and dispatch."""
    sent = EmailService.send_organization_credentials(
        org_name="Tesla Motors",
        org_email="contact@tesla.com",
        admin_email="admin@tesla.com",
        temporary_password="TempPassword#2026",
        portal_url="http://localhost:8000"
    )
    assert sent is True


def test_smtp_monthly_attendance_report_email():
    """Verify monthly report email template and calculation summary."""
    stats = {
        "total_staff": 50,
        "present_days": 1100,
        "late_days": 42,
        "absent_days": 18,
        "regularized_days": 12,
    }
    sent = EmailService.send_monthly_attendance_report(
        org_name="Tesla Motors",
        org_email="contact@tesla.com",
        month_name="August 2026",
        stats=stats
    )
    assert sent is True


def test_notification_flow_and_read_status(client, seed_test_data, db):
    # 1. Login as Employee
    login_emp = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    emp_token = login_emp.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    emp_user = seed_test_data["emp_user"]
    org = seed_test_data["org1"]

    # 2. Dispatch check-in alert & check-out alert
    NotificationService.send_check_in_alert(
        db=db,
        organization_id=org.id,
        user_id=emp_user.id,
        start_time="09:00 AM"
    )
    NotificationService.send_check_out_alert(
        db=db,
        organization_id=org.id,
        user_id=emp_user.id
    )

    # 3. Employee fetches their notifications
    notifs_res = client.get("/api/v1/notifications", headers=emp_headers)
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    assert len(notifs) >= 2
    first_notif = notifs[0]
    assert first_notif["is_read"] is False

    # 4. Employee marks notification as read
    read_res = client.put(f"/api/v1/notifications/{first_notif['id']}/read", headers=emp_headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True


def test_monthly_report_email_endpoint(client, seed_test_data):
    # Login as Admin
    login_admin = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@acme.com", "password": "Password123!"}
    )
    admin_token = login_admin.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Trigger monthly report email
    res = client.post("/api/v1/reports/monthly/email?year=2026&month=8", headers=admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["recipient"] == seed_test_data["org1"].email
