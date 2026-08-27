import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Input, Button, Card } from "../index";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface RegularizeModalProps {
  visible: boolean;
  date: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegularizeModal: React.FC<RegularizeModalProps> = ({
  visible,
  date,
  onClose,
  onSuccess,
}) => {
  const [requestType, setRequestType] = useState<string>("missed_both");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("18:00");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Error", "Please enter a reason for regularization.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/regularizations/requests", {
        attendance_date: date,
        request_type: requestType,
        requested_check_in: `${date}T${checkInTime}:00Z`,
        requested_check_out: `${date}T${checkOutTime}:00Z`,
        reason: reason.trim(),
      });

      Alert.alert("Success", "Regularization request submitted for manager approval.");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to submit regularization request.";
      Alert.alert("Regularization Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Card style={styles.modalCard}>
          <Text style={styles.title}>Apply Regularization</Text>
          <Text style={styles.subtitle}>Date: {date}</Text>

          {/* Type Selector Pills */}
          <Text style={styles.label}>Request Type:</Text>
          <View style={styles.pillRow}>
            {[
              { id: "missed_both", label: "Full Day" },
              { id: "missed_check_in", label: "Check-In" },
              { id: "missed_check_out", label: "Check-Out" },
              { id: "on_duty", label: "On Duty" },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setRequestType(item.id)}
                style={[
                  styles.pill,
                  requestType === item.id && styles.activePill,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    requestType === item.id && styles.activePillText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Requested Check-In (HH:MM)"
            placeholder="09:00"
            value={checkInTime}
            onChangeText={setCheckInTime}
          />

          <Input
            label="Requested Check-Out (HH:MM)"
            placeholder="18:00"
            value={checkOutTime}
            onChangeText={setCheckOutTime}
          />

          <Input
            label="Reason"
            placeholder="Why was regular punch missed?"
            value={reason}
            onChangeText={setReason}
            multiline
          />

          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              size="small"
              onPress={onClose}
              style={styles.actionBtn}
            />
            <Button
              title="Submit Request"
              onPress={handleSubmit}
              loading={submitting}
              size="small"
              style={styles.actionBtn}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  modalCard: {
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  pill: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.secondaryLight,
  },
  activePill: {
    backgroundColor: theme.colors.primary,
  },
  pillText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  activePillText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  actionBtn: {
    minWidth: 100,
  },
});

export default RegularizeModal;
