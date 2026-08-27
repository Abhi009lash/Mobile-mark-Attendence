import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../common/Card";
import { StatusBadge } from "../common/StatusBadge";
import { theme } from "../../styles/theme";
import { AttendanceRegularization } from "../../types";

export interface RegItemCardProps {
  item: AttendanceRegularization;
}

export const RegItemCard: React.FC<RegItemCardProps> = ({ item }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.infoContainer}>
          <Text style={styles.date}>{item.attendance_date}</Text>
          <Text style={styles.typeBadge}>
            {item.request_type.replace(/_/g, " ").toUpperCase()}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.timesRow}>
        <Text style={styles.timeText}>
          Req In: <Text style={styles.timeVal}>{item.requested_check_in ? new Date(item.requested_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</Text>
        </Text>
        <Text style={styles.timeText}>
          Req Out: <Text style={styles.timeVal}>{item.requested_check_out ? new Date(item.requested_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</Text>
        </Text>
      </View>

      <Text style={styles.reason} numberOfLines={2}>Reason: {item.reason}</Text>

      {item.rejection_reason ? (
        <Text style={styles.rejectionText}>
          Rejection Note: {item.rejection_reason}
        </Text>
      ) : null}
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
  infoContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  date: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  typeBadge: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "700",
    marginTop: 2,
  },
  timesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  timeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  timeVal: {
    fontWeight: "600",
    color: theme.colors.text,
  },
  reason: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  rejectionText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default RegItemCard;
