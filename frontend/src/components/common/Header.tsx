import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { theme } from "../../styles/theme";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={styles.rightAction}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.rightActionText}>{rightAction.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  backButton: {
    marginRight: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  backText: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.text,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  rightAction: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    flexShrink: 0,
  },
  rightActionText: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    color: theme.colors.primary,
  },
});

export default Header;
