import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTodayStatus = async () => {
    try {
      const res = await apiClient.get<AttendanceRecord[]>("/attendance/history?limit=1");
      if (res.data && res.data.length > 0) setTodayAttendance(res.data[0]);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadTodayStatus();
  }, []);

  const navItems = [
    { title: "📅 History", screen: "AttendanceHistory" },
    { title: "🌴 Apply Leave", screen: "LeaveApplication" },
    { title: "📋 Leave Records", screen: "LeaveHistory" },
    { title: "⏳ Regularizations", screen: "RegularizationHistory" },
    { title: "🕒 My Shift", screen: "ShiftDetails" },
    { title: "🔔 Notifications", screen: "Notifications" },
  ];

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || "Employee"} 👤
          </Text>
        </TouchableOpacity>
        <Button title="Sign Out" variant="outline" size="small" onPress={logout} />
      </View>

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

      <Button
        title="📍 Mark Attendance (GPS Check-In)"
        onPress={() => navigation.navigate("CheckIn")}
        size="large"
        style={styles.checkInBtn}
      />

      <View style={styles.grid}>
        {navItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.gridCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.gridText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  clockCard: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  dateText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  statusLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
  },
  checkInBtn: {
    minHeight: 48,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: theme.spacing.sm,
  },
  gridCard: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 52,
  },
  gridText: {
    ...theme.typography.bodySmall,
    fontWeight: "700",
    color: theme.colors.text,
  },
});

export default DashboardScreen;
