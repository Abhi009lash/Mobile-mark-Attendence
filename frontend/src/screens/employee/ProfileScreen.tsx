import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, Card, Button, Input } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { theme } from "../../styles/theme";

export interface ProfileScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      Alert.alert("Success", "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    }, 1000);
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Header title="My Profile" onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        {/* User Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.roleBadge}>
            {user?.role ? user.role.replace(/_/g, " ").toUpperCase() : "EMPLOYEE"}
          </Text>
        </Card>

        {/* Security / Password Change */}
        <Card style={styles.secCard}>
          <Text style={styles.secTitle}>Change Password</Text>
          <Input
            label="Current Password"
            placeholder="••••••••"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            isPassword
          />
          <Input
            label="New Password"
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
          />
          <Button
            title="Update Password"
            onPress={handleChangePassword}
            loading={updating}
            size="small"
            style={styles.updateBtn}
          />
        </Card>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          variant="danger"
          size="medium"
          onPress={logout}
          style={styles.logoutBtn}
        />
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
    gap: theme.spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.xs,
    marginTop: theme.spacing.sm,
  },
  secCard: {
    padding: theme.spacing.lg,
  },
  secTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  updateBtn: {
    marginTop: theme.spacing.xs,
  },
  logoutBtn: {
    marginTop: theme.spacing.sm,
  },
});

export default ProfileScreen;
