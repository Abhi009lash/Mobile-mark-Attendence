import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../common/Card";
import { StatusBadge } from "../common/StatusBadge";
import { theme } from "../../styles/theme";
import { LeaveRequest } from "../../types";

export interface LeaveItemCardProps {
  item: LeaveRequest;
}

export const LeaveItemCard: React.FC<LeaveItemCardProps> = ({ item }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.dates}>
            {item.start_date} → {item.end_date}
          </Text>
          {item.leave_type && (
            <Text style={styles.typeName}>{item.leave_type.name}</Text>
          )}
        </View>
        <StatusBadge status={item.status} />
      </View>
      {item.reason ? (
        <Text style={styles.reason} numberOfLines={2}>
          {item.reason}
        </Text>
      ) : null}
      <Text style={styles.appliedDate}>
        Applied on: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dateContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  dates: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  typeName: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  reason: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  appliedDate: {
    ...theme.typography.caption,
    marginTop: 2,
  },
});

export default LeaveItemCard;
