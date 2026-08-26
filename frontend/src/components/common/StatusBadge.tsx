import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../styles/theme";

export type BadgeStatus =
  | "present"
  | "late"
  | "half_day"
  | "absent"
  | "on_leave"
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "inactive";

export interface StatusBadgeProps {
  status: BadgeStatus | string;
  label?: string;
  style?: ViewStyle;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  present: { bg: theme.colors.successLight, text: theme.colors.success, label: "Present" },
  late: { bg: theme.colors.warningLight, text: theme.colors.warning, label: "Late" },
  half_day: { bg: theme.colors.infoLight, text: theme.colors.info, label: "Half Day" },
  absent: { bg: theme.colors.dangerLight, text: theme.colors.danger, label: "Absent" },
  on_leave: { bg: theme.colors.secondaryLight, text: theme.colors.secondary, label: "On Leave" },
  pending: { bg: theme.colors.warningLight, text: theme.colors.warning, label: "Pending" },
  approved: { bg: theme.colors.successLight, text: theme.colors.success, label: "Approved" },
  rejected: { bg: theme.colors.dangerLight, text: theme.colors.danger, label: "Rejected" },
  active: { bg: theme.colors.successLight, text: theme.colors.success, label: "Active" },
  inactive: { bg: theme.colors.secondaryLight, text: theme.colors.secondary, label: "Inactive" },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  style,
}) => {
  const config = statusConfig[status.toLowerCase()] || {
    bg: theme.colors.secondaryLight,
    text: theme.colors.secondary,
    label: status,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>
        {label || config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: theme.spacing.xs - 1,
    paddingHorizontal: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    ...theme.typography.caption,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});

export default StatusBadge;
