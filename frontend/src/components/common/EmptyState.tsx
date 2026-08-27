import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../styles/theme";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "📋",
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="small"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  icon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  actionBtn: {
    marginTop: theme.spacing.xs,
  },
});

export default EmptyState;
