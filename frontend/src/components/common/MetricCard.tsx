import React from "react";
import { Text, StyleSheet, ViewStyle } from "react-native";
import { Card } from "./Card";
import { theme } from "../../styles/theme";

export interface MetricCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  valueColor = theme.colors.primary,
  subtitle,
  style,
}) => {
  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.caption,
    marginTop: 2,
  },
});

export default MetricCard;
