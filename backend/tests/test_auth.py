from app.core.security import decode_token, verify_password, get_password_hash


def test_password_hashing():
    raw = "MySecret123!"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_login_success_and_token_lifetimes(client, seed_test_data):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 900  # 15 minutes = 900 seconds
    assert data["email"] == "john@acme.com"
    assert data["role"] == "employee"

    # Decode and verify access token claims
    access_claims = decode_token(data["access_token"])
    assert access_claims["type"] == "access"
    assert access_claims["role"] == "employee"
    assert access_claims["organization_id"] == seed_test_data["org1"].id
    # 15 minutes lifetime validation (900 seconds)
    assert access_claims["exp"] - access_claims["iat"] == 900

    # Decode and verify refresh token claims (90 days = 7776000 seconds)
    refresh_claims = decode_token(data["refresh_token"])
    assert refresh_claims["type"] == "refresh"
    assert refresh_claims["exp"] - refresh_claims["iat"] == 90 * 86400


def test_login_invalid_credentials(client, seed_test_data):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "WrongPassword!"}
    )
    assert response.status_code == 401


def test_refresh_token_rotation(client, seed_test_data):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    initial_refresh = login_res.json()["refresh_token"]

    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh}
    )
    assert refresh_res.status_code == 200
    new_data = refresh_res.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["refresh_token"] != initial_refresh

    # Using the old refresh token again should be rejected (revoked / rotated)
    reused_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh}
    )
    assert reused_res.status_code == 401


def test_logout_and_revocation(client, seed_test_data):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "john@acme.com", "password": "Password123!"}
    )
    token_data = login_res.json()
    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]

    # Verify protected route works before logout
    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200

    # Logout
    logout_res = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
        headers=headers
    )
    assert logout_res.status_code == 200

    # Protected route should now fail with 401 (token blacklisted)
    me_after_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_after_res.status_code == 401
