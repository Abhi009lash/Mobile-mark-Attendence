import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import { ScreenWrapper, Header, LoadingSpinner, EmptyState, FilterPills, RegItemCard } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { AttendanceRegularization } from "../../types";

export interface RegularizationHistoryScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export const RegularizationHistoryScreen: React.FC<RegularizationHistoryScreenProps> = ({
  navigation,
}) => {
  const [requests, setRequests] = useState<AttendanceRegularization[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchRegs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<AttendanceRegularization[]>("/regularizations/requests");
      setRequests(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegs();
  }, []);

  const filtered = requests.filter((r) =>
    filter === "all" ? true : r.status.toLowerCase() === filter
  );

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header title="Regularization Requests" onBack={() => navigation.goBack()} />

      <FilterPills
        options={FILTER_OPTIONS}
        selectedId={filter}
        onSelect={setFilter}
        style={styles.filters}
      />

      {loading ? (
        <LoadingSpinner message="Loading regularization requests..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⏳"
          title="No Regularization Requests"
          description="You haven't submitted any attendance regularizations."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RegItemCard item={item} />}
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

export default RegularizationHistoryScreen;
