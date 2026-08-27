import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { ScreenWrapper, Header, Card, EmptyState, LoadingSpinner } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { NotificationResponse } from "../../types";

export interface NotificationsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<NotificationResponse[]>("/notifications");
      setNotifications(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "check_in_alert":
        return "⏰";
      case "check_out_alert":
        return "🏁";
      case "leave_approved":
        return "✅";
      case "leave_rejected":
        return "❌";
      case "regularization_approved":
        return "🎉";
      case "regularization_rejected":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchNotifs,
        }}
      />

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Notifications"
          description="You're all caught up with your attendance & leave updates."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleMarkAsRead(item.id)}
            >
              <Card style={[styles.card, !item.is_read && styles.unreadCard]}>
                <View style={styles.headerRow}>
                  <View style={styles.titleWithIcon}>
                    <Text style={styles.icon}>{getIconForType(item.type)}</Text>
                    <Text style={styles.title}>{item.title}</Text>
                  </View>
                  {!item.is_read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.md,
    gap: 4,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    flex: 1,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  body: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  time: {
    ...theme.typography.caption,
    marginTop: 4,
  },
});

export default NotificationsScreen;
