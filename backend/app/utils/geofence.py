import math
from typing import Tuple


def haversine_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> float:
    """
    Calculate the great circle distance between two points on the earth in meters.
    Formula: Haversine
    """
    # Earth radius in meters
    R = 6371000.0

    # Convert degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance


def is_within_geofence(
    user_lat: float,
    user_lon: float,
    target_lat: float,
    target_lon: float,
    radius_meters: float
) -> Tuple[bool, float]:
    """
    Check if a given (user_lat, user_lon) is within radius_meters of (target_lat, target_lon).
    Returns (is_inside: bool, actual_distance_meters: float).
    """
    distance = haversine_distance(user_lat, user_lon, target_lat, target_lon)
    return (distance <= radius_meters, round(distance, 2))
