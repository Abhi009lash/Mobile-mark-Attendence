def test_tenant_isolation_branches_and_users(client, seed_test_data):
    # Login as Org 1 Admin
    login_res1 = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@acme.com", "password": "Password123!"}
    )
    token1 = login_res1.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Org 1 Admin lists branches -> should only see Org 1 branches
    branches_res = client.get("/api/v1/branches", headers=headers1)
    assert branches_res.status_code == 200
    branches = branches_res.json()
    for b in branches:
        assert b["organization_id"] == seed_test_data["org1"].id
        assert b["organization_id"] != seed_test_data["org2"].id

    # Org 1 Admin lists users -> should only see Org 1 users
    users_res = client.get("/api/v1/users", headers=headers1)
    assert users_res.status_code == 200
    users = users_res.json()
    for u in users:
        assert u["organization_id"] == seed_test_data["org1"].id
        assert u["organization_id"] != seed_test_data["org2"].id


def test_tenant_isolation_employee_attendance(client, seed_test_data):
    # Login as Org 2 Employee (Jane Smith)
    login_res2 = client.post(
        "/api/v1/auth/login",
        json={"email": "jane@beta.com", "password": "Password123!"}
    )
    token2 = login_res2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Org 2 Employee requests attendance history
    history_res = client.get("/api/v1/attendance/history", headers=headers2)
    assert history_res.status_code == 200
    history = history_res.json()
    for record in history:
        assert record["organization_id"] == seed_test_data["org2"].id
