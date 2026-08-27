import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../styles/theme";

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterPillsProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  options,
  selectedId,
  onSelect,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            style={[styles.pill, isSelected && styles.activePill]}
          >
            <Text style={[styles.text, isSelected && styles.activeText]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  pill: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activePill: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  text: {
    ...theme.typography.caption,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  activeText: {
    color: "#FFFFFF",
  },
});

export default FilterPills;
