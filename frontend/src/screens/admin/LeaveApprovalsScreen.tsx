import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, LoadingSpinner, EmptyState, ApprovalActionCard } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { LeaveRequest } from "../../types";

export interface LeaveApprovalsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const LeaveApprovalsScreen: React.FC<LeaveApprovalsScreenProps> = ({
  navigation,
}) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<LeaveRequest[]>("/leaves/requests?status_filter=pending");
      setRequests(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleAction = async (id: number, status: "approved" | "rejected") => {
    setProcessingId(id);
    try {
      await apiClient.put(`/leaves/requests/${id}/status`, { status });
      Alert.alert("Success", `Leave request ${status}.`);
      fetchPendingLeaves();
    } catch {
      Alert.alert("Error", `Failed to update leave request status.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Leave Approvals"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchPendingLeaves,
        }}
      />

      {loading ? (
        <LoadingSpinner message="Loading pending leave requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="🌴"
          title="All Caught Up"
          description="No pending leave applications requiring approval."
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ApprovalActionCard
              title={`Employee #${item.employee_id}`}
              subtitle={item.leave_type?.name || "Leave Application"}
              details={[
                { label: "Dates", value: `${item.start_date} to ${item.end_date}` },
                { label: "Reason", value: item.reason || "None specified" },
              ]}
              onApprove={() => handleAction(item.id, "approved")}
              onReject={() => handleAction(item.id, "rejected")}
              loading={processingId === item.id}
            />
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
  },
});

export default LeaveApprovalsScreen;
