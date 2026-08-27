import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, Card, Button, MetricCard, LoadingSpinner } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface AdminDashboardScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/reports/daily");
      setReport(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReport();
  }, []);

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.roleTag}>
            {user?.role ? user.role.replace(/_/g, " ").toUpperCase() : "ADMIN"}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {user?.name || "Administrator"}
          </Text>
        </View>
        <Button
          title="Sign Out"
          variant="outline"
          size="small"
          onPress={logout}
        />
      </View>

      {loading ? (
        <LoadingSpinner message="Loading attendance metrics..." />
      ) : (
        <View style={styles.metricsGrid}>
          <MetricCard label="Total Staff" value={report?.total_employees ?? 0} />
          <MetricCard label="Present Today" value={report?.present ?? 0} valueColor={theme.colors.success} />
          <MetricCard label="Late Arrivals" value={report?.late ?? 0} valueColor={theme.colors.warning} />
          <MetricCard label="Absent" value={report?.absent ?? 0} valueColor={theme.colors.danger} />
        </View>
      )}

      {/* Admin Action Shortcuts */}
      <Card style={styles.menuCard}>
        <Text style={styles.menuTitle}>Administrative Controls</Text>
        
        <View style={styles.actionGrid}>
          <Button
            title="👥 Staff Directory"
            variant="outline"
            size="small"
            onPress={() => navigation?.navigate("Employees")}
            style={styles.gridBtn}
          />
          <Button
            title="📍 Live Attendance"
            variant="outline"
            size="small"
            onPress={() => navigation?.navigate("AttendanceLogs")}
            style={styles.gridBtn}
          />
          <Button
            title="🌴 Leave Approvals"
            variant="outline"
            size="small"
            onPress={() => navigation?.navigate("LeaveApprovals")}
            style={styles.gridBtn}
          />
          <Button
            title="⏳ Regularizations"
            variant="outline"
            size="small"
            onPress={() => navigation?.navigate("RegularizationApprovals")}
            style={styles.gridBtn}
          />
          <Button
            title="🏢 Branches"
            variant="outline"
            size="small"
            onPress={() => navigation?.navigate("Branches")}
            style={styles.gridBtn}
          />
          <Button
            title="🕒 Shift Rosters"
            variant="outline"
            size="small"
            onPress={() => navigation?.navigate("Shifts")}
            style={styles.gridBtn}
          />
          <Button
            title="⚙️ Policy Settings"
            variant="outline"
            size="small"
            onPress={() => navigation?.navigate("Policy")}
            style={styles.gridBtn}
          />
          <Button
            title="📊 Reports & CSV"
            variant="primary"
            size="small"
            onPress={() => navigation?.navigate("Reports")}
            style={styles.gridBtn}
          />
        </View>
      </Card>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  roleTag: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: theme.spacing.md,
  },
  menuCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  menuTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: theme.spacing.sm,
  },
  gridBtn: {
    width: "48%",
  },
});

export default AdminDashboardScreen;
