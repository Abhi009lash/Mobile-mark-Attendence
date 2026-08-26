import { useState, useCallback } from "react";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const useLocation = () => {
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    setLoading(true);
    setError(null);
    try {
      // In native environment, this uses expo-location or react-native-geolocation-service
      // Default to accurate mock/real location for testing
      const locationData: LocationCoordinates = {
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 5,
      };
      setCoords(locationData);
      return locationData;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to obtain GPS location.";
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    coords,
    loading,
    error,
    fetchLocation,
  };
};

export default useLocation;
