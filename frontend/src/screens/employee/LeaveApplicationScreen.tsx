import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, Card, Input, Button, StatusBadge } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { LeaveType, LeaveRequest } from "../../types";

export interface LeaveApplicationScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const LeaveApplicationScreen: React.FC<LeaveApplicationScreenProps> = ({
  navigation,
}) => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    fetchLeaveTypesAndRequests();
  }, []);

  const fetchLeaveTypesAndRequests = async () => {
    try {
      const [typesRes, requestsRes] = await Promise.all([
        apiClient.get<LeaveType[]>("/leaves/types"),
        apiClient.get<LeaveRequest[]>("/leaves/requests"),
      ]);
      setLeaveTypes(typesRes.data);
      if (typesRes.data.length > 0) {
        setSelectedTypeId(typesRes.data[0].id);
      }
      setRecentRequests(requestsRes.data);
    } catch {
      // Fallback
    }
  };

  const handleApply = async () => {
    if (!selectedTypeId) {
      Alert.alert("Error", "Please select a leave type.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/leaves/requests", {
        leave_type_id: selectedTypeId,
        start_date: startDate,
        end_date: endDate,
        reason,
      });

      Alert.alert("Success", "Leave request submitted successfully!");
      setReason("");
      fetchLeaveTypesAndRequests();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to submit leave request.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Header title="Leave Application" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Apply for Leave</Text>

          <Input
            label="Start Date (YYYY-MM-DD)"
            placeholder="2026-08-27"
            value={startDate}
            onChangeText={setStartDate}
          />

          <Input
            label="End Date (YYYY-MM-DD)"
            placeholder="2026-08-28"
            value={endDate}
            onChangeText={setEndDate}
          />

          <Input
            label="Reason"
            placeholder="Reason for leave..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            containerStyle={{ height: 90 }}
          />

          <Button
            title="Submit Leave Request"
            onPress={handleApply}
            loading={submitting}
            style={styles.submitBtn}
          />
        </Card>

        <Text style={styles.historyTitle}>Recent Requests</Text>
        {recentRequests.map((req) => (
          <Card key={req.id} style={styles.reqCard}>
            <View style={styles.reqHeader}>
              <Text style={styles.reqDates}>{req.start_date} to {req.end_date}</Text>
              <StatusBadge status={req.status} />
            </View>
            {req.reason ? <Text style={styles.reqReason}>{req.reason}</Text> : null}
          </Card>
        ))}
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
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  submitBtn: {
    marginTop: theme.spacing.sm,
  },
  historyTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  reqCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  reqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reqDates: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    color: theme.colors.text,
  },
  reqReason: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});

export default LeaveApplicationScreen;
