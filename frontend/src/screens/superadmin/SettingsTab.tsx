import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthenticatedUser } from '../auth/LogoutScreen';

interface SettingsTabProps {
  user?: AuthenticatedUser | null;
  onLogout?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ user, onLogout }) => {
  const handleConfirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to end your Super Admin session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="shield" size={26} color="#1657DE" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.full_name || 'Super Admin'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'admin@geopoint.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role || 'SUPER_ADMIN'}</Text>
            </View>
          </View>
        </View>

        {/* Platform Configuration */}
        <Text style={styles.sectionTitle}>Platform Configuration</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="newspaper-outline" size={18} color="#1657DE" />
              <Text style={styles.rowLabel}>Audit Logs & Activity</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="lock-closed-outline" size={18} color="#1657DE" />
              <Text style={styles.rowLabel}>Security & 2FA</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={18} color="#1657DE" />
              <Text style={styles.rowLabel}>Platform Alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* System Info */}
        <Text style={styles.sectionTitle}>System</Text>
        <View style={styles.cardGroup}>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="cube-outline" size={18} color="#64748B" />
              <Text style={styles.rowLabel}>App Version</Text>
            </View>
            <Text style={styles.rowValue}>v2.4.0 (Build 57)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleConfirmLogout}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  screenHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContainer: { flex: 1 },
  contentContainer: { padding: 16, paddingTop: 8, paddingBottom: 110 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  profileEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: '#1657DE' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  rowValue: { fontSize: 13, color: '#64748B' },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  logoutButtonText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
