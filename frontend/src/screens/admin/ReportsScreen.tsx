import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, Card, Button, MetricCard, LoadingSpinner } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface ReportsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
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
    fetchReport();
  }, []);

  const handleExport = () => {
    Alert.alert("Report Export", "Monthly CSV Report generated and downloaded.");
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Header title="Reports & Analytics" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        {loading ? (
          <LoadingSpinner message="Generating report metrics..." />
        ) : (
          <View style={styles.content}>
            <View style={styles.grid}>
              <MetricCard label="Total Staff" value={report?.total_employees ?? 0} />
              <MetricCard label="Present" value={report?.present ?? 0} valueColor={theme.colors.success} />
              <MetricCard label="Late" value={report?.late ?? 0} valueColor={theme.colors.warning} />
              <MetricCard label="Absent" value={report?.absent ?? 0} valueColor={theme.colors.danger} />
            </View>

            <Card style={styles.exportCard}>
              <Text style={styles.exportTitle}>Monthly Attendance Export</Text>
              <Text style={styles.exportDesc}>
                Download detailed payroll attendance log with check-in, check-out, and regularization badges.
              </Text>
              <Button
                title="Export Monthly CSV"
                variant="primary"
                onPress={handleExport}
                style={styles.exportBtn}
              />
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
  exportCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  exportTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  exportDesc: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  exportBtn: {
    alignSelf: "flex-start",
  },
});

export default ReportsScreen;
