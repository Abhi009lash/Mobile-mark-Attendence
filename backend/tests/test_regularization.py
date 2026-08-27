from datetime import datetime, timezone, timedelta


def test_regularization_application_and_approval(client, seed_test_data):
    # 1. Login as Employee
    login_emp = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    emp_token = login_emp.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)

    # 2. Employee submits regularization request
    req_payload = {
        "attendance_date": str(yesterday),
        "request_type": "missed_both",
        "requested_check_in": f"{yesterday}T09:00:00Z",
        "requested_check_out": f"{yesterday}T18:00:00Z",
        "reason": "Battery died on field client visit"
    }
    app_res = client.post("/api/v1/regularizations/requests", json=req_payload, headers=emp_headers)
    assert app_res.status_code == 201
    reg_data = app_res.json()
    assert reg_data["status"] == "pending"
    assert reg_data["request_type"] == "missed_both"
    reg_id = reg_data["id"]

    # 3. Login as Admin/Manager
    login_admin = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@acme.com", "password": "Password123!"}
    )
    admin_token = login_admin.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 4. Admin approves regularization
    approve_res = client.put(f"/api/v1/regularizations/requests/{reg_id}/approve", headers=admin_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # 5. Verify attendance record is regularized to 'present'
    hist_res = client.get("/api/v1/attendance/history", headers=emp_headers)
    assert hist_res.status_code == 200
    records = hist_res.json()
    matched = [r for r in records if r["date"] == str(yesterday)]
    assert len(matched) == 1
    assert matched[0]["status"] == "present"
    assert matched[0]["source"] in ["manual", "regularized"]

    # 6. Verify audit log was created
    audit_res = client.get("/api/v1/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    audit_logs = audit_res.json()
    assert len(audit_logs) >= 1
    assert audit_logs[0]["action"] == "REGULARIZATION_APPROVED"


def test_regularization_expired_7_days_rejected(client, seed_test_data):
    login_emp = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    emp_token = login_emp.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # Date 10 days ago (exceeds 7-day window)
    expired_date = datetime.now(timezone.utc).date() - timedelta(days=10)

    req_payload = {
        "attendance_date": str(expired_date),
        "request_type": "missed_check_in",
        "requested_check_in": f"{expired_date}T09:00:00Z",
        "reason": "Forgot to check in long time ago"
    }
    app_res = client.post("/api/v1/regularizations/requests", json=req_payload, headers=emp_headers)
    assert app_res.status_code == 400
    assert "expired" in app_res.json()["detail"].lower()
