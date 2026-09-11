import pytest


def test_root_endpoint(client):
    """Verifies that root URL returns project metadata and status 200."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Geopoint Attendance SaaS"
    assert "health" in data


def test_health_check_endpoint(client):
    """Verifies that /api/v1/health returns healthy and database is connected."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["version"] == "1.0.0"
