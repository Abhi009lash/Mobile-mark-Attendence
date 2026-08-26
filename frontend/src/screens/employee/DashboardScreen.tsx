import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, RefreshControl } from "react-native";
import { ScreenWrapper, Card, Button, StatusBadge } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { AttendanceRecord } from "../../types";

export interface DashboardScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTodayStatus = async () => {
    setRefreshing(true);
    try {
      const res = await apiClient.get<AttendanceRecord[]>("/attendance/history?limit=1");
      if (res.data && res.data.length > 0) {
        setTodayAttendance(res.data[0]);
      }
    } catch {
      // Ignore network errors
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTodayStatus();
  }, []);

  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={styles.container}
    >
      {/* Header Profile Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "Employee"}</Text>
        </View>
        <Button
          title="Sign Out"
          variant="outline"
          size="small"
          onPress={logout}
        />
      </View>

      {/* Clock & Status Card */}
      <Card style={styles.clockCard}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.timeText}>{currentTime}</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Today's Status:</Text>
          <StatusBadge
            status={todayAttendance?.status || "absent"}
            label={todayAttendance?.status ? undefined : "Not Marked"}
          />
        </View>
      </Card>

      {/* Primary Action */}
      <View style={styles.actionSection}>
        <Button
          title="Mark Attendance (GPS Check-In)"
          onPress={() => navigation.navigate("CheckIn")}
          size="large"
          style={styles.checkInBtn}
        />
      </View>

      {/* Quick Navigation Cards */}
      <View style={styles.quickNavGrid}>
        <Card style={styles.navCard}>
          <Text style={styles.navCardTitle}>Attendance History</Text>
          <Text style={styles.navCardDesc}>View your monthly attendance log</Text>
          <Button
            title="View History"
            variant="secondary"
            size="small"
            onPress={() => navigation.navigate("AttendanceHistory")}
            style={styles.navBtn}
          />
        </Card>

        <Card style={styles.navCard}>
          <Text style={styles.navCardTitle}>Apply Leave</Text>
          <Text style={styles.navCardDesc}>Submit sick, casual, or earned leave</Text>
          <Button
            title="Apply Leave"
            variant="secondary"
            size="small"
            onPress={() => navigation.navigate("LeaveApplication")}
            style={styles.navBtn}
          />
        </Card>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    ...theme.typography.bodySmall,
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  clockCard: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  dateText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  timeText: {
    fontSize: 36,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  statusLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    color: theme.colors.text,
  },
  actionSection: {
    marginBottom: theme.spacing.lg,
  },
  checkInBtn: {
    height: 54,
  },
  quickNavGrid: {
    gap: theme.spacing.md,
  },
  navCard: {
    padding: theme.spacing.lg,
  },
  navCardTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  navCardDesc: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  navBtn: {
    alignSelf: "flex-start",
  },
});

export default DashboardScreen;
