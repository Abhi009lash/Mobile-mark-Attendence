from app.utils.geofence import haversine_distance, is_within_geofence


def test_haversine_same_point():
    lat, lon = 12.9716, 77.5946
    distance = haversine_distance(lat, lon, lat, lon)
    assert distance == 0.0


def test_haversine_known_distance():
    # Distance between Bangalore HQ (12.9716, 77.5946) and nearby point (~50 meters)
    lat1, lon1 = 12.971600, 77.594600
    lat2, lon2 = 12.971900, 77.594600
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    assert 30.0 < distance < 40.0


def test_is_within_geofence():
    target_lat, target_lon = 12.971600, 77.594600
    radius = 100.0  # 100 meters

    # Point 33 meters away -> inside
    inside, dist = is_within_geofence(12.971900, 77.594600, target_lat, target_lon, radius)
    assert inside is True
    assert dist <= radius

    # Point 500 meters away -> outside
    outside, dist_far = is_within_geofence(12.976000, 77.594600, target_lat, target_lon, radius)
    assert outside is False
    assert dist_far > radius
