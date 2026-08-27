import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, Header, Card, LoadingSpinner } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { Shift } from "../../types";

export interface ShiftDetailsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const ShiftDetailsScreen: React.FC<ShiftDetailsScreenProps> = ({
  navigation,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchShifts();
  }, []);

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Header title="My Shift Details" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        {loading ? (
          <LoadingSpinner message="Loading assigned shift..." />
        ) : (
          <View style={styles.content}>
            <Card style={styles.activeShiftCard}>
              <Text style={styles.badge}>ACTIVE ASSIGNMENT</Text>
              <Text style={styles.shiftName}>
                {shifts[0]?.name || "Standard Morning Shift"}
              </Text>
              <Text style={styles.shiftHours}>
                {shifts[0]?.start_time ? `${shifts[0].start_time} - ${shifts[0].end_time}` : "09:00 AM - 06:00 PM"}
              </Text>
              <Text style={styles.graceText}>
                Late Grace Period: {shifts[0]?.grace_minutes ?? 15} minutes
              </Text>
            </Card>

            <Card style={styles.rulesCard}>
              <Text style={styles.rulesTitle}>Attendance Rules</Text>
              <Text style={styles.ruleItem}>• Punch-in within grace period to avoid late mark.</Text>
              <Text style={styles.ruleItem}>• GPS verification required for each punch.</Text>
              <Text style={styles.ruleItem}>• Missed punch can be regularized within 7 days.</Text>
            </Card>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  body: {
    padding: theme.spacing.lg,
  },
  content: {
    gap: theme.spacing.lg,
  },
  activeShiftCard: {
    padding: theme.spacing.xl,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  badge: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.xs,
    marginBottom: theme.spacing.sm,
  },
  shiftName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: "center",
  },
  shiftHours: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  graceText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  rulesCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  rulesTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  ruleItem: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default ShiftDetailsScreen;
