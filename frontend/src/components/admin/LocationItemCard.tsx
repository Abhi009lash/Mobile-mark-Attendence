import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../common/Card";
import { StatusBadge } from "../common/StatusBadge";
import { theme } from "../../styles/theme";
import { LocationItem } from "../../types";

export interface LocationItemCardProps {
  location: LocationItem;
}

export const LocationItemCard: React.FC<LocationItemCardProps> = ({ location }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{location.name}</Text>
          <Text style={styles.radiusBadge}>Radius: {location.radius}m</Text>
        </View>
        <StatusBadge status={location.status} />
      </View>
      <View style={styles.coords}>
        <Text style={styles.coordText}>Lat: {location.latitude.toFixed(4)}</Text>
        <Text style={styles.coordText}>Lng: {location.longitude.toFixed(4)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  radiusBadge: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  coords: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.secondaryLight,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
    marginTop: theme.spacing.xs,
  },
  coordText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
});

export default LocationItemCard;
