import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import { ScreenWrapper, Header, LoadingSpinner, EmptyState, LocationItemCard } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { LocationItem } from "../../types";

export interface LocationGeofenceScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const LocationGeofenceScreen: React.FC<LocationGeofenceScreenProps> = ({
  navigation,
}) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<LocationItem[]>("/locations");
      setLocations(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Geofenced Locations"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchLocations,
        }}
      />

      {loading ? (
        <LoadingSpinner message="Loading work locations..." />
      ) : locations.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No Locations Configured"
          description="Add GPS coordinates and geofence radius for attendance."
        />
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <LocationItemCard location={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  list: {
    padding: theme.spacing.lg,
  },
});

export default LocationGeofenceScreen;
