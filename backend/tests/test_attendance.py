from datetime import datetime, timezone


def test_attendance_checkin_inside_geofence(client, seed_test_data):
    # Login as John Doe
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check in at HQ coordinates (exact match within 100m radius)
    checkin_res = client.post(
        "/api/v1/attendance/check-in",
        json={"latitude": 12.9716, "longitude": 77.5946},
        headers=headers
    )
    assert checkin_res.status_code == 201
    data = checkin_res.json()
    assert data["employee_id"] == seed_test_data["employee"].id
    assert data["status"] in ["present", "late"]
    assert data["check_in_latitude"] == 12.9716


def test_attendance_checkin_outside_geofence_rejected(client, seed_test_data):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Coordinates far away (~50km away)
    far_res = client.post(
        "/api/v1/attendance/check-in",
        json={"latitude": 13.5000, "longitude": 78.0000},
        headers=headers
    )
    assert far_res.status_code == 400
    assert "Outside" in far_res.json()["detail"]


def test_duplicate_checkin_rejected(client, seed_test_data):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # First check in
    res1 = client.post(
        "/api/v1/attendance/check-in",
        json={"latitude": 12.9716, "longitude": 77.5946},
        headers=headers
    )
    assert res1.status_code == 201

    # Second check in on same day
    res2 = client.post(
        "/api/v1/attendance/check-in",
        json={"latitude": 12.9716, "longitude": 77.5946},
        headers=headers
    )
    assert res2.status_code == 400
    assert "already marked" in res2.json()["detail"]


def test_checkout_flow(client, seed_test_data):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check in
    client.post(
        "/api/v1/attendance/check-in",
        json={"latitude": 12.9716, "longitude": 77.5946},
        headers=headers
    )

    # Check out
    checkout_res = client.post(
        "/api/v1/attendance/check-out",
        json={"latitude": 12.9716, "longitude": 77.5946},
        headers=headers
    )
    assert checkout_res.status_code == 200
    assert checkout_res.json()["check_out"] is not None


def test_offline_sync_batch(client, seed_test_data):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    emp_id = seed_test_data["employee"].id
    sync_payload = {
        "items": [
            {
                "client_id": "uuid-sync-test-001",
                "employee_id": emp_id,
                "date": "2026-08-20",
                "check_in": "2026-08-20T09:05:00Z",
                "check_out": "2026-08-20T17:30:00Z",
                "check_in_latitude": 12.9716,
                "check_in_longitude": 77.5946,
            }
        ]
    }

    # First sync -> should succeed
    sync_res = client.post("/api/v1/attendance/sync", json=sync_payload, headers=headers)
    assert sync_res.status_code == 200
    data = sync_res.json()
    assert data["synced_count"] == 1

    # Second sync of identical client_id -> should be skipped (idempotent deduplication)
    sync_res2 = client.post("/api/v1/attendance/sync", json=sync_payload, headers=headers)
    assert sync_res2.status_code == 200
    assert sync_res2.json()["skipped_count"] == 1
