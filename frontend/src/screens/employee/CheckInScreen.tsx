import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, Card, Button, StatusBadge } from "../../components";
import { useLocation } from "../../hooks/useLocation";
import { useAuth } from "../../hooks/useAuth";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { sqliteService } from "../../services/storage/sqlite";

export interface CheckInScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { coords, loading: locLoading, fetchLocation } = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleCheckIn = async () => {
    if (!coords) {
      setErrorMessage("Waiting for GPS coordinates. Please ensure GPS is enabled.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await apiClient.post("/attendance/check-in", {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setSuccessMessage(`Check-in recorded successfully! Status: ${response.data.status}`);
    } catch (err: any) {
      if (!err.response) {
        // Network error -> save to local SQLite queue
        const clientId = `offline_${Date.now()}`;
        await sqliteService.enqueueAttendance({
          client_id: clientId,
          employee_id: user?.id || 1,
          date: new Date().toISOString().split("T")[0],
          check_in: new Date().toISOString(),
          check_in_latitude: coords.latitude,
          check_in_longitude: coords.longitude,
        });

        setSuccessMessage("Offline mode: Attendance saved locally. Will sync when online.");
      } else {
        const msg = err.response?.data?.detail || "Check-in rejected.";
        setErrorMessage(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!coords) {
      setErrorMessage("Waiting for GPS coordinates.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiClient.post("/attendance/check-out", {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setSuccessMessage("Check-out recorded successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Check-out rejected.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Header title="GPS Attendance" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        {successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* GPS Coordinates Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          {coords ? (
            <View style={styles.coordsBox}>
              <Text style={styles.coordLabel}>Latitude: <Text style={styles.coordValue}>{coords.latitude.toFixed(6)}</Text></Text>
              <Text style={styles.coordLabel}>Longitude: <Text style={styles.coordValue}>{coords.longitude.toFixed(6)}</Text></Text>
              <Text style={styles.coordLabel}>Accuracy: <Text style={styles.coordValue}>±{coords.accuracy || 5}m</Text></Text>
            </View>
          ) : (
            <Text style={styles.loadingCoords}>
              {locLoading ? "Acquiring GPS location..." : "GPS unavailable"}
            </Text>
          )}

          <Button
            title="Refresh GPS"
            variant="outline"
            size="small"
            onPress={fetchLocation}
            loading={locLoading}
            style={styles.refreshBtn}
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Confirm Check-In"
            onPress={handleCheckIn}
            loading={submitting}
            disabled={!coords}
            size="large"
            style={styles.actionBtn}
          />

          <Button
            title="Check-Out"
            variant="secondary"
            onPress={handleCheckOut}
            loading={submitting}
            disabled={!coords}
            size="large"
            style={styles.actionBtn}
          />
        </View>
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
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  coordsBox: {
    backgroundColor: theme.colors.secondaryLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  coordLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  coordValue: {
    fontWeight: "600",
    color: theme.colors.text,
  },
  loadingCoords: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  refreshBtn: {
    alignSelf: "flex-start",
  },
  actions: {
    gap: theme.spacing.md,
  },
  actionBtn: {
    height: 52,
  },
  successBanner: {
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  successText: {
    ...theme.typography.bodySmall,
    color: theme.colors.success,
    fontWeight: "600",
  },
  errorBanner: {
    backgroundColor: theme.colors.dangerLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.danger,
    fontWeight: "600",
  },
});

export default CheckInScreen;
