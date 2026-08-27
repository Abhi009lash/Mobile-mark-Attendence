import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, Alert } from "react-native";
import { Card, Input, Button } from "../index";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface CreateOrgModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOrgModal: React.FC<CreateOrgModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userLimit, setUserLimit] = useState("50");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Validation Error", "Organization Name and Email are required.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/organizations", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        user_limit: parseInt(userLimit, 10) || 50,
      });

      Alert.alert(
        "Organization Provisioned",
        `Created ${name} successfully! Onboarding credentials sent to ${email}.`
      );
      setName("");
      setEmail("");
      setPhone("");
      setUserLimit("50");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to create organization.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Card style={styles.card}>
          <Text style={styles.title}>Onboard New Organization</Text>
          <Text style={styles.subtitle}>
            Credentials will be emailed automatically to the organization address.
          </Text>

          <Input
            label="Organization Name"
            placeholder="e.g. Acme Corporation"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Management Email"
            placeholder="admin@acme.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+1 555-0199"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="User / Employee Limit"
            placeholder="50"
            value={userLimit}
            onChangeText={setUserLimit}
            keyboardType="number-pad"
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
              title="Create & Send Credentials"
              onPress={handleSubmit}
              loading={loading}
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  actionBtn: {
    minWidth: 100,
  },
});

export default CreateOrgModal;
