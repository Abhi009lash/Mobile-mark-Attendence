import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, LoadingSpinner, EmptyState, ApprovalActionCard } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { AttendanceRegularization } from "../../types";

export interface RegularizationApprovalsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const RegularizationApprovalsScreen: React.FC<RegularizationApprovalsScreenProps> = ({
  navigation,
}) => {
  const [requests, setRequests] = useState<AttendanceRegularization[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPendingRegs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<AttendanceRegularization[]>("/regularizations/requests?status_filter=pending");
      setRequests(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRegs();
  }, []);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await apiClient.put(`/regularizations/requests/${id}/approve`);
      Alert.alert("Approved", "Attendance successfully regularized.");
      fetchPendingRegs();
    } catch {
      Alert.alert("Error", "Failed to approve regularization.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await apiClient.put(`/regularizations/requests/${id}/reject`, {
        rejection_reason: "Rejected by manager",
      });
      Alert.alert("Rejected", "Regularization request rejected.");
      fetchPendingRegs();
    } catch {
      Alert.alert("Error", "Failed to reject regularization.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Regularization Approvals"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchPendingRegs,
        }}
      />

      {loading ? (
        <LoadingSpinner message="Loading pending regularizations..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="⏳"
          title="All Requests Handled"
          description="No pending attendance regularization requests."
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ApprovalActionCard
              title={`Employee #${item.employee_id}`}
              subtitle={item.request_type.replace(/_/g, " ").toUpperCase()}
              details={[
                { label: "Date", value: item.attendance_date },
                { label: "Reason", value: item.reason },
              ]}
              onApprove={() => handleApprove(item.id)}
              onReject={() => handleReject(item.id)}
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

export default RegularizationApprovalsScreen;
