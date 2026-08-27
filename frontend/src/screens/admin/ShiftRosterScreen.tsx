import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { ScreenWrapper, Header, Card, LoadingSpinner, EmptyState } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { Shift } from "../../types";

export interface ShiftRosterScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const ShiftRosterScreen: React.FC<ShiftRosterScreenProps> = ({
  navigation,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Shift[]>("/shifts");
      setShifts(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Shift Rosters"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchShifts,
        }}
      />

      {loading ? (
        <LoadingSpinner message="Loading shifts & rosters..." />
      ) : shifts.length === 0 ? (
        <EmptyState
          icon="🕒"
          title="No Shifts Configured"
          description="Create shifts like Morning, Evening, or Night Shift."
        />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.shiftCard}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                {item.is_night_shift && <Text style={styles.nightBadge}>NIGHT</Text>}
              </View>
              <Text style={styles.timing}>
                {item.start_time} → {item.end_time}
              </Text>
              <Text style={styles.grace}>
                Grace Period: {item.grace_minutes} mins
              </Text>
            </Card>
          )}
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
    gap: theme.spacing.md,
  },
  shiftCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  nightBadge: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: "#6366F1",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timing: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  grace: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

export default ShiftRosterScreen;
