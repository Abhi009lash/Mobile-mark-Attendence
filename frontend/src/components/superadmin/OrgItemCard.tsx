import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "../common/Card";
import { StatusBadge } from "../common/StatusBadge";
import { theme } from "../../styles/theme";

export interface OrgItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_limit: number;
  status: string;
}

export interface OrgItemCardProps {
  item: OrgItem;
  onToggleStatus: (org: OrgItem) => void;
  onDelete: (org: OrgItem) => void;
}

export const OrgItemCard: React.FC<OrgItemCardProps> = ({
  item,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.limitBadge}>Limit: {item.user_limit} Users</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onToggleStatus(item)}
            style={[
              styles.actionBtn,
              item.status === "active" ? styles.suspendBtn : styles.activateBtn,
            ]}
          >
            <Text style={styles.actionBtnText}>
              {item.status === "active" ? "Suspend" : "Activate"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(item)}
            style={[styles.actionBtn, styles.deleteBtn]}
          >
            <Text style={[styles.actionBtnText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  info: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  email: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  phone: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  limitBadge: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.xs,
  },
  suspendBtn: {
    backgroundColor: theme.colors.warningLight,
  },
  activateBtn: {
    backgroundColor: theme.colors.successLight,
  },
  deleteBtn: {
    backgroundColor: theme.colors.dangerLight,
  },
  actionBtnText: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.text,
  },
  deleteText: {
    color: theme.colors.danger,
  },
});

export default OrgItemCard;
