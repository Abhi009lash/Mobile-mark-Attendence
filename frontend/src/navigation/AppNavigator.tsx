import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components";

// Auth Screen
import LoginScreen from "../screens/auth/LoginScreen";

// Employee Screens
import DashboardScreen from "../screens/employee/DashboardScreen";
import CheckInScreen from "../screens/employee/CheckInScreen";
import AttendanceHistoryScreen from "../screens/employee/AttendanceHistoryScreen";
import LeaveApplicationScreen from "../screens/employee/LeaveApplicationScreen";
import LeaveHistoryScreen from "../screens/employee/LeaveHistoryScreen";
import RegularizationHistoryScreen from "../screens/employee/RegularizationHistoryScreen";
import ProfileScreen from "../screens/employee/ProfileScreen";
import NotificationsScreen from "../screens/employee/NotificationsScreen";
import ShiftDetailsScreen from "../screens/employee/ShiftDetailsScreen";

// Admin Screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import EmployeeDirectoryScreen from "../screens/admin/EmployeeDirectoryScreen";
import AttendanceLogsScreen from "../screens/admin/AttendanceLogsScreen";
import LeaveApprovalsScreen from "../screens/admin/LeaveApprovalsScreen";
import RegularizationApprovalsScreen from "../screens/admin/RegularizationApprovalsScreen";
import BranchListScreen from "../screens/admin/BranchListScreen";
import LocationGeofenceScreen from "../screens/admin/LocationGeofenceScreen";
import ShiftRosterScreen from "../screens/admin/ShiftRosterScreen";
import PolicySettingsScreen from "../screens/admin/PolicySettingsScreen";
import ReportsScreen from "../screens/admin/ReportsScreen";

// Super Admin Screens
import SuperAdminDashboardScreen from "../screens/superadmin/SuperAdminDashboardScreen";
import OrganizationDirectoryScreen from "../screens/superadmin/OrganizationDirectoryScreen";
import PlatformAnalyticsScreen from "../screens/superadmin/PlatformAnalyticsScreen";

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<string>("Dashboard");

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Initializing GeoPunch..." />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  const navigate = (screen: string) => setCurrentScreen(screen);
  const goBack = () => setCurrentScreen("Dashboard");
  const navProps = { navigation: { navigate, goBack } };

  // 1. Super Admin Portal
  if (user.role === "super_admin") {
    switch (currentScreen) {
      case "Organizations":
        return <OrganizationDirectoryScreen {...navProps} />;
      case "PlatformAnalytics":
        return <PlatformAnalyticsScreen {...navProps} />;
      default:
        return <SuperAdminDashboardScreen {...navProps} />;
    }
  }

  // 2. Org Admin & HR & Branch Manager Portal
  if (
    user.role === "organization_owner" ||
    user.role === "hr_admin" ||
    user.role === "attendance_admin" ||
    user.role === "branch_manager"
  ) {
    switch (currentScreen) {
      case "Employees":
        return <EmployeeDirectoryScreen {...navProps} />;
      case "AttendanceLogs":
        return <AttendanceLogsScreen {...navProps} />;
      case "LeaveApprovals":
        return <LeaveApprovalsScreen {...navProps} />;
      case "RegularizationApprovals":
        return <RegularizationApprovalsScreen {...navProps} />;
      case "Branches":
        return <BranchListScreen {...navProps} />;
      case "Locations":
        return <LocationGeofenceScreen {...navProps} />;
      case "Shifts":
        return <ShiftRosterScreen {...navProps} />;
      case "Policy":
        return <PolicySettingsScreen {...navProps} />;
      case "Reports":
        return <ReportsScreen {...navProps} />;
      default:
        return <AdminDashboardScreen {...navProps} />;
    }
  }

  // 3. Employee Portal
  switch (currentScreen) {
    case "CheckIn":
      return <CheckInScreen {...navProps} />;
    case "AttendanceHistory":
      return <AttendanceHistoryScreen {...navProps} />;
    case "LeaveApplication":
      return <LeaveApplicationScreen {...navProps} />;
    case "LeaveHistory":
      return <LeaveHistoryScreen {...navProps} />;
    case "RegularizationHistory":
      return <RegularizationHistoryScreen {...navProps} />;
    case "Profile":
      return <ProfileScreen {...navProps} />;
    case "Notifications":
      return <NotificationsScreen {...navProps} />;
    case "ShiftDetails":
      return <ShiftDetailsScreen {...navProps} />;
    default:
      return <DashboardScreen {...navProps} />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
});

export default AppNavigator;
