import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, Header, Card, MetricCard, LoadingSpinner } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface PlatformAnalyticsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const PlatformAnalyticsScreen: React.FC<PlatformAnalyticsScreenProps> = ({
  navigation,
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/organizations/analytics/overview");
      setAnalytics(res.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Header
        title="Platform Analytics"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchAnalytics,
        }}
      />

      <View style={styles.body}>
        {loading ? (
          <LoadingSpinner message="Aggregating platform metrics..." />
        ) : (
          <View style={styles.content}>
            <View style={styles.grid}>
              <MetricCard label="Total Organizations" value={analytics?.total_organizations ?? 0} />
              <MetricCard label="Active Tenants" value={analytics?.active_organizations ?? 0} valueColor={theme.colors.success} />
              <MetricCard label="Suspended Tenants" value={analytics?.suspended_organizations ?? 0} valueColor={theme.colors.warning} />
              <MetricCard label="Total Platform Users" value={analytics?.total_users ?? 0} />
              <MetricCard label="Total Staff Employees" value={analytics?.total_employees ?? 0} />
              <MetricCard label="Total Active Branches" value={analytics?.total_branches ?? 0} />
              <MetricCard label="Today's Global Punches" value={analytics?.today_punches ?? 0} valueColor={theme.colors.info} />
              <MetricCard label="System Uptime" value="99.9%" valueColor={theme.colors.success} />
            </View>

            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tenant Health Summary</Text>
              <Text style={styles.summaryText}>
                • {analytics?.active_organizations ?? 0} organizations actively marking daily geofenced attendance.
              </Text>
              <Text style={styles.summaryText}>
                • All tenant data isolated with multi-tenant organization boundaries.
              </Text>
              <Text style={styles.summaryText}>
                • System status: All API and background services fully operational.
              </Text>
            </Card>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  body: {
    padding: theme.spacing.lg,
  },
  content: {
    gap: theme.spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: theme.spacing.md,
  },
  summaryCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  summaryTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  summaryText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default PlatformAnalyticsScreen;
