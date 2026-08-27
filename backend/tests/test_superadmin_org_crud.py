def test_superadmin_platform_analytics(client):
    # 1. Login as Super Admin
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "superadmin@example.com", "password": "superpassword123"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Analytics Overview
    res = client.get("/api/v1/organizations/analytics/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_organizations" in data
    assert "active_organizations" in data
    assert "total_users" in data
    assert "today_punches" in data


def test_superadmin_organization_crud_lifecycle(client):
    # 1. Login as Super Admin
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "superadmin@example.com", "password": "superpassword123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. POST (Create) new organization with user limit
    create_payload = {
        "name": "Zenith Cloud Solutions",
        "email": "contact@zenithcloud.io",
        "phone": "+1 415-555-0188",
        "user_limit": 150
    }
    create_res = client.post("/api/v1/organizations", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    org_data = create_res.json()
    assert org_data["name"] == "Zenith Cloud Solutions"
    assert org_data["user_limit"] == 150
    assert org_data["status"] == "active"
    org_id = org_data["id"]

    # 3. GET (List & Search)
    list_res = client.get("/api/v1/organizations?search=Zenith", headers=headers)
    assert list_res.status_code == 200
    matched = list_res.json()
    assert len(matched) == 1
    assert matched[0]["id"] == org_id

    # 4. PUT (Update status to suspended and increase user limit)
    update_res = client.put(
        f"/api/v1/organizations/{org_id}",
        json={"status": "suspended", "user_limit": 200},
        headers=headers
    )
    assert update_res.status_code == 200
    updated_org = update_res.json()
    assert updated_org["status"] == "suspended"
    assert updated_org["user_limit"] == 200

    # 5. DELETE (Delete organization)
    del_res = client.delete(f"/api/v1/organizations/{org_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/api/v1/organizations/{org_id}", headers=headers)
    assert get_res.status_code == 404
