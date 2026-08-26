import { calculateDistanceMeters, checkGeofenceStatus } from "../../services/location/geofence";

describe("Geofence Location Service", () => {
  it("calculates zero distance for identical coordinates", () => {
    const lat = 12.9716;
    const lon = 77.5946;
    const distance = calculateDistanceMeters(lat, lon, lat, lon);
    expect(distance).toBe(0);
  });

  it("accurately detects when employee is within 100m geofence radius", () => {
    const hqLat = 12.9716;
    const hqLon = 77.5946;
    const userLat = 12.9718; // ~22m away
    const userLon = 77.5946;

    const result = checkGeofenceStatus(userLat, userLon, hqLat, hqLon, 100);
    expect(result.isInside).toBe(true);
    expect(result.distanceMeters).toBeLessThanOrEqual(100);
  });

  it("accurately detects when employee is outside 100m geofence radius", () => {
    const hqLat = 12.9716;
    const hqLon = 77.5946;
    const farLat = 13.0000; // ~3.1 km away
    const farLon = 77.5946;

    const result = checkGeofenceStatus(farLat, farLon, hqLat, hqLon, 100);
    expect(result.isInside).toBe(false);
    expect(result.distanceMeters).toBeGreaterThan(100);
  });
});
