import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Dock, DockItemData } from '../../components/navigation/Dock';
import { DashboardTab } from './DashboardTab';
import { OrganizationsTab } from './OrganizationsTab';
import { AdminsTab } from './AdminsTab';
import { SettingsTab } from './SettingsTab';
import { Header } from '../../components/common/Header';
import { AuthenticatedUser } from '../auth/LogoutScreen';

interface SuperAdminShellProps {
  user?: AuthenticatedUser | null;
  onLogout?: () => void;
}

export type SuperAdminTab = 'dashboard' | 'organizations' | 'admins' | 'settings';

export const SuperAdminShell: React.FC<SuperAdminShellProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('dashboard');

  const dockItems: DockItemData[] = [
    {
      id: 'dashboard',
      label: 'Home',
      onClick: () => setActiveTab('dashboard'),
      icon: ({ isActive, size }) => (
        <Ionicons
          name="home-outline"
          size={size}
          color={isActive ? '#1657DE' : '#334155'}
        />
      ),
    },
    {
      id: 'organizations',
      label: 'Archive',
      onClick: () => setActiveTab('organizations'),
      icon: ({ isActive, size }) => (
        <Ionicons
          name="archive-outline"
          size={size}
          color={isActive ? '#1657DE' : '#334155'}
        />
      ),
    },
    {
      id: 'admins',
      label: 'Profile',
      onClick: () => setActiveTab('admins'),
      icon: ({ isActive, size }) => (
        <Ionicons
          name="person-circle-outline"
          size={size + 2}
          color={isActive ? '#1657DE' : '#334155'}
        />
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      onClick: () => setActiveTab('settings'),
      icon: ({ isActive, size }) => (
        <Ionicons
          name="settings-outline"
          size={size}
          color={isActive ? '#1657DE' : '#334155'}
        />
      ),
    },
  ];

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab onNavigateTab={(t) => setActiveTab(t as SuperAdminTab)} />;
      case 'organizations':
        return <OrganizationsTab />;
      case 'admins':
        return <AdminsTab />;
      case 'settings':
        return <SettingsTab user={user} onLogout={onLogout} />;
      default:
        return <DashboardTab onNavigateTab={(t) => setActiveTab(t as SuperAdminTab)} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header
        name={user?.full_name || 'Mahendra'}
        role={user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Administrator'}
      />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* React Bits Fixed Bottom Dock Navigation */}
      <Dock
        items={dockItems}
        activeId={activeTab}
        panelHeight={72}
        baseItemSize={52}
        magnification={62}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001C6B', // Seamless with header banner top edge
    position: 'relative',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
