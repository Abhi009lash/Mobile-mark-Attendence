import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { ScreenWrapper, Header, Card, StatusBadge, LoadingSpinner } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { AttendanceRecord } from "../../types";

export interface AttendanceHistoryScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const AttendanceHistoryScreen: React.FC<AttendanceHistoryScreenProps> = ({
  navigation,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<AttendanceRecord[]>("/attendance/history?limit=30");
      setRecords(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.dateText}>{item.date}</Text>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>
          Check-In: <Text style={styles.timeVal}>{item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</Text>
        </Text>
        <Text style={styles.timeLabel}>
          Check-Out: <Text style={styles.timeVal}>{item.check_out ? new Date(item.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</Text>
        </Text>
      </View>
      <Text style={styles.sourceText}>Source: {item.source}</Text>
    </Card>
  );

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header title="Attendance History" onBack={() => navigation.goBack()} />

      {loading ? (
        <LoadingSpinner message="Loading attendance records..." />
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No attendance records found.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  recordCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
  },
  timeLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  timeVal: {
    fontWeight: "600",
    color: theme.colors.text,
  },
  sourceText: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs - 2,
    textTransform: "capitalize",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
});

export default AttendanceHistoryScreen;
