import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { authApi, UserProfile } from '../../api/auth';

export type AuthenticatedUser = UserProfile;

interface LogoutScreenProps {
  user: AuthenticatedUser;
  accessToken?: string | null;
  onLogoutSuccess: () => void;
}

export const LogoutScreen: React.FC<LogoutScreenProps> = ({
  user,
  accessToken,
  onLogoutSuccess,
}) => {
  const [loggingOut, setLoggingOut] = useState(false);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'GP';
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      } else {
        await authApi.logout();
      }
    } catch {
      // Continue client session teardown even on offline/network errors
    } finally {
      setLoggingOut(false);
      onLogoutSuccess();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusLabel}>Active Session</Text>
        </View>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(user.full_name)}</Text>
        </View>

        <Text style={styles.userName}>{user.full_name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{user.role.replace('_', ' ')}</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          {loggingOut ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={styles.logoutButtonText}>Log out</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 340, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  statusLabel: { color: '#047857', fontSize: 12, fontWeight: '600' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1657DE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4, textAlign: 'center' },
  userEmail: { fontSize: 14, color: '#64748B', marginBottom: 16, textAlign: 'center' },
  rolePill: { backgroundColor: '#EFF6FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 24 },
  roleText: { color: '#1D4ED8', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  logoutButton: { width: '100%', borderColor: '#FCA5A5', borderWidth: 1.5, backgroundColor: '#FEF2F2', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});
