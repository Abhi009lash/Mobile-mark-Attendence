import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../styles/theme";

export interface LogoProps {
  size?: "small" | "medium" | "large";
  showTagline?: boolean;
  style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({
  size = "medium",
  showTagline = true,
  style,
}) => {
  const isSmall = size === "small";
  const isLarge = size === "large";

  return (
    <View style={[styles.container, style]}>
      {/* Visual Logo Badge */}
      <View
        style={[
          styles.badge,
          isSmall && styles.badgeSmall,
          isLarge && styles.badgeLarge,
        ]}
      >
        <Text
          style={[
            styles.iconText,
            isSmall && styles.iconTextSmall,
            isLarge && styles.iconTextLarge,
          ]}
        >
          📍
        </Text>
      </View>

      {/* Brand Title */}
      <Text
        style={[
          styles.brandTitle,
          isSmall && styles.brandTitleSmall,
          isLarge && styles.brandTitleLarge,
        ]}
      >
        Geo<Text style={styles.brandAccent}>Punch</Text>
      </Text>

      {/* Optional Tagline */}
      {showTagline && (
        <Text style={styles.tagline}>
          WORKFORCE ATTENDANCE SAAS
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md,
  },
  badgeSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginBottom: theme.spacing.xs,
  },
  badgeLarge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    marginBottom: theme.spacing.md,
  },
  iconText: {
    fontSize: 32,
  },
  iconTextSmall: {
    fontSize: 20,
  },
  iconTextLarge: {
    fontSize: 42,
  },
  brandTitle: {
    ...theme.typography.h1,
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  brandTitleSmall: {
    fontSize: 18,
  },
  brandTitleLarge: {
    fontSize: 34,
  },
  brandAccent: {
    color: theme.colors.primary,
  },
  tagline: {
    ...theme.typography.caption,
    fontSize: 10,
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: "700",
  },
});

export default Logo;
