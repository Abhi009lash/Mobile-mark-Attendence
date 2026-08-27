import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import { ScreenWrapper, Header, LoadingSpinner, EmptyState, FilterPills, LeaveItemCard } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { LeaveRequest } from "../../types";

export interface LeaveHistoryScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
}

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export const LeaveHistoryScreen: React.FC<LeaveHistoryScreenProps> = ({ navigation }) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<LeaveRequest[]>("/leaves/requests");
      setRequests(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filtered = requests.filter((r) =>
    filter === "all" ? true : r.status.toLowerCase() === filter
  );

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Leave History"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "+ Apply",
          onPress: () => navigation.navigate("LeaveApplication"),
        }}
      />

      <FilterPills
        options={FILTER_OPTIONS}
        selectedId={filter}
        onSelect={setFilter}
        style={styles.filters}
      />

      {loading ? (
        <LoadingSpinner message="Loading leave applications..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🌴"
          title="No Leave Records"
          description={filter === "all" ? "You have not submitted any leaves yet." : `No ${filter} leave requests found.`}
          actionLabel="Apply for Leave"
          onAction={() => navigation.navigate("LeaveApplication")}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <LeaveItemCard item={item} />}
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
  filters: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});

export default LeaveHistoryScreen;
