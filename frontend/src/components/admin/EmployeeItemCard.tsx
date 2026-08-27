import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../common/Card";
import { StatusBadge } from "../common/StatusBadge";
import { theme } from "../../styles/theme";
import { EmployeeProfile } from "../../types";

export interface EmployeeItemCardProps {
  employee: EmployeeProfile;
}

export const EmployeeItemCard: React.FC<EmployeeItemCardProps> = ({ employee }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.code}>{employee.employee_code}</Text>
          <Text style={styles.designation}>
            {employee.designation || "Staff Member"}
          </Text>
        </View>
        <StatusBadge status={employee.status} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.meta}>
          Branch: #{employee.branch_id || "Main HQ"}
        </Text>
        <Text style={styles.meta}>
          Joined: {employee.joining_date || "—"}
        </Text>
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
  code: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  designation: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

export default EmployeeItemCard;
