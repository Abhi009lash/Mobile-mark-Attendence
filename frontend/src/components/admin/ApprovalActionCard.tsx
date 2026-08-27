import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { theme } from "../../styles/theme";

export interface ApprovalActionCardProps {
  title: string;
  subtitle: string;
  details: Array<{ label: string; value: string }>;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}

export const ApprovalActionCard: React.FC<ApprovalActionCardProps> = ({
  title,
  subtitle,
  details,
  onApprove,
  onReject,
  loading = false,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.detailsBox}>
        {details.map((d, idx) => (
          <View key={idx} style={styles.detailRow}>
            <Text style={styles.label}>{d.label}:</Text>
            <Text style={styles.value} numberOfLines={1}>{d.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title="Reject"
          variant="outline"
          size="small"
          onPress={onReject}
          disabled={loading}
          style={styles.rejectBtn}
          textStyle={{ color: theme.colors.danger }}
        />
        <Button
          title="Approve"
          size="small"
          onPress={onApprove}
          loading={loading}
          style={styles.approveBtn}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  header: {
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  detailsBox: {
    backgroundColor: theme.colors.secondaryLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
    marginVertical: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  value: {
    ...theme.typography.caption,
    fontWeight: "600",
    color: theme.colors.text,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  rejectBtn: {
    borderColor: theme.colors.danger,
    minWidth: 80,
  },
  approveBtn: {
    backgroundColor: theme.colors.success,
    minWidth: 90,
  },
});

export default ApprovalActionCard;
