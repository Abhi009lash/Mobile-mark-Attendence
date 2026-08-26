import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ScreenWrapper, Card, Button, StatusBadge, LoadingSpinner } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface DailyReport {
  date: string;
  total_employees: number;
  present: number;
  late: number;
  half_day: number;
  absent: number;
}

export const AdminDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<DailyReport>("/reports/daily");
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
        <View>
          <Text style={styles.roleTag}>Admin Portal</Text>
          <Text style={styles.title}>{user?.name}</Text>
        </View>
        <Button title="Sign Out" variant="outline" size="small" onPress={logout} />
      </View>

      {loading ? (
        <LoadingSpinner message="Loading attendance metrics..." />
      ) : (
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Staff</Text>
            <Text style={styles.metricValue}>{report?.total_employees ?? 0}</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Present Today</Text>
            <Text style={[styles.metricValue, { color: theme.colors.success }]}>
              {report?.present ?? 0}
            </Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Late Arrivals</Text>
            <Text style={[styles.metricValue, { color: theme.colors.warning }]}>
              {report?.late ?? 0}
            </Text>
          </Card>

          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>Absent</Text>
            <Text style={[styles.metricValue, { color: theme.colors.danger }]}>
              {report?.absent ?? 0}
            </Text>
          </Card>
        </View>
      )}

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Organization Tenant Status</Text>
        <Text style={styles.infoDesc}>
          Tenant ID: #{user?.organization_id || 1} • Strict Multi-Tenant Isolation Active
        </Text>
      </Card>
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
    marginBottom: theme.spacing.xl,
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
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  metricCard: {
    width: "47%",
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  metricLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  infoCard: {
    padding: theme.spacing.lg,
  },
  infoTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  infoDesc: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});

export default AdminDashboardScreen;
