def test_shift_creation_and_assignment(client, seed_test_data):
    # Login as Admin
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@acme.com", "password": "Password123!"}
    )
    admin_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create a Night Shift (21:00 to 06:00)
    shift_payload = {
        "name": "Night Shift",
        "start_time": "21:00:00",
        "end_time": "06:00:00",
        "grace_minutes": 15,
        "is_night_shift": True
    }
    create_res = client.post("/api/v1/shifts", json=shift_payload, headers=headers)
    assert create_res.status_code == 201
    shift_data = create_res.json()
    assert shift_data["name"] == "Night Shift"
    assert shift_data["is_night_shift"] is True
    shift_id = shift_data["id"]

    # 2. Assign Shift to John Doe
    assign_payload = {
        "employee_id": seed_test_data["employee"].id,
        "shift_id": shift_id,
        "start_date": "2026-09-01",
        "end_date": "2026-09-15"
    }
    assign_res = client.post("/api/v1/shifts/assign", json=assign_payload, headers=headers)
    assert assign_res.status_code == 201
    sched_data = assign_res.json()
    assert sched_data["employee_id"] == seed_test_data["employee"].id
    assert sched_data["shift_id"] == shift_id


def test_holiday_creation_and_listing(client, seed_test_data):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@acme.com", "password": "Password123!"}
    )
    admin_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create Org-wide Holiday
    create_res = client.post(
        "/api/v1/holidays",
        json={"name": "New Year Holiday", "date": "2027-01-01"},
        headers=headers
    )
    assert create_res.status_code == 201

    # List Holidays
    list_res = client.get("/api/v1/holidays", headers=headers)
    assert list_res.status_code == 200
    holidays = list_res.json()
    assert len(holidays) >= 1
    assert holidays[0]["name"] == "New Year Holiday"
