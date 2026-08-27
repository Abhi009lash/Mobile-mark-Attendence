import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, Card, Input, Button, LoadingSpinner } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface PolicySettingsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const PolicySettingsScreen: React.FC<PolicySettingsScreenProps> = ({
  navigation,
}) => {
  const [startTime, setStartTime] = useState("09:00:00");
  const [endTime, setEndTime] = useState("18:00:00");
  const [lateGrace, setLateGrace] = useState("15");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/policies");
        if (response.data) {
          setStartTime(response.data.working_start_time || "09:00:00");
          setEndTime(response.data.working_end_time || "18:00:00");
          setLateGrace(String(response.data.late_threshold ?? 15));
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post("/policies", {
        working_start_time: startTime,
        working_end_time: endTime,
        late_threshold: parseInt(lateGrace, 10) || 15,
        overtime_enabled: true,
      });
      Alert.alert("Success", "Attendance policy updated.");
    } catch {
      Alert.alert("Error", "Failed to save attendance policy.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Header title="Attendance Policy" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        {loading ? (
          <LoadingSpinner message="Loading policy settings..." />
        ) : (
          <Card style={styles.card}>
            <Text style={styles.title}>Working Hours & Late Threshold</Text>

            <Input
              label="Working Start Time (HH:MM:SS)"
              placeholder="09:00:00"
              value={startTime}
              onChangeText={setStartTime}
            />

            <Input
              label="Working End Time (HH:MM:SS)"
              placeholder="18:00:00"
              value={endTime}
              onChangeText={setEndTime}
            />

            <Input
              label="Late Grace Threshold (Minutes)"
              placeholder="15"
              value={lateGrace}
              onChangeText={setLateGrace}
              keyboardType="number-pad"
            />

            <Button
              title="Save Policy Settings"
              onPress={handleSave}
              loading={saving}
              style={styles.saveBtn}
            />
          </Card>
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
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  saveBtn: {
    marginTop: theme.spacing.md,
  },
});

export default PolicySettingsScreen;
