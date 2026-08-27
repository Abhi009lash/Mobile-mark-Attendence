import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { ScreenWrapper, Header, Card, StatusBadge, LoadingSpinner, EmptyState } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { AttendanceRecord } from "../../types";

export interface AttendanceLogsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const AttendanceLogsScreen: React.FC<AttendanceLogsScreenProps> = ({
  navigation,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<AttendanceRecord[]>("/attendance/history?limit=50");
      setRecords(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Live Attendance Feed"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchLogs,
        }}
      />

      {loading ? (
        <LoadingSpinner message="Loading live attendance logs..." />
      ) : records.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No Attendance Logs"
          description="No punches recorded for today yet."
        />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.logCard}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.empTitle}>Employee #{item.employee_id}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.times}>
                <Text style={styles.timeLabel}>
                  In: <Text style={styles.val}>{item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</Text>
                </Text>
                <Text style={styles.timeLabel}>
                  Out: <Text style={styles.val}>{item.check_out ? new Date(item.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</Text>
                </Text>
              </View>

              <Text style={styles.source}>Source: {item.source}</Text>
            </Card>
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
    gap: theme.spacing.md,
  },
  logCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  empTitle: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  timeLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  val: {
    fontWeight: "600",
    color: theme.colors.text,
  },
  source: {
    ...theme.typography.caption,
    marginTop: 2,
    textTransform: "capitalize",
  },
});

export default AttendanceLogsScreen;
