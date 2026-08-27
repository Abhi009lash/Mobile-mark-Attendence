import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, Card, Button, MetricCard, LoadingSpinner, CreateOrgModal } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface SuperAdminDashboardScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export const SuperAdminDashboardScreen: React.FC<SuperAdminDashboardScreenProps> = ({
  navigation,
}) => {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      <View style={styles.header}>
        <View>
          <Text style={styles.tag}>UNIVERSAL SUPERADMIN</Text>
          <Text style={styles.name}>{user?.name || "Super Administrator"}</Text>
        </View>
        <Button title="Sign Out" variant="outline" size="small" onPress={logout} />
      </View>

      {loading ? (
        <LoadingSpinner message="Loading platform analytics..." />
      ) : (
        <View style={styles.grid}>
          <MetricCard label="Total Organizations" value={analytics?.total_organizations ?? 0} />
          <MetricCard label="Active Tenants" value={analytics?.active_organizations ?? 0} valueColor={theme.colors.success} />
          <MetricCard label="Total Platform Users" value={analytics?.total_users ?? 0} />
          <MetricCard label="Today's Global Punches" value={analytics?.today_punches ?? 0} valueColor={theme.colors.info} />
        </View>
      )}

      {/* Platform Actions */}
      <Card style={styles.menuCard}>
        <Text style={styles.menuTitle}>Tenant & Platform Controls</Text>

        <Button
          title="➕ Onboard New Organization"
          variant="primary"
          onPress={() => setShowCreateModal(true)}
          style={styles.menuBtn}
        />

        <Button
          title="🏢 Customer Organizations Directory"
          variant="secondary"
          onPress={() => navigation.navigate("Organizations")}
          style={styles.menuBtn}
        />

        <Button
          title="📊 Platform Analytics Breakdown"
          variant="outline"
          onPress={() => navigation.navigate("PlatformAnalytics")}
          style={styles.menuBtn}
        />
      </Card>

      {showCreateModal && (
        <CreateOrgModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchAnalytics}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  grid: {
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
  menuBtn: {
    minHeight: 48,
  },
});

export default SuperAdminDashboardScreen;
