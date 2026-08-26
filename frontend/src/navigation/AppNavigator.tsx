import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { DashboardScreen } from "../screens/employee/DashboardScreen";
import { CheckInScreen } from "../screens/employee/CheckInScreen";
import { AttendanceHistoryScreen } from "../screens/employee/AttendanceHistoryScreen";
import { LeaveApplicationScreen } from "../screens/employee/LeaveApplicationScreen";
import { AdminDashboardScreen } from "../screens/admin/AdminDashboardScreen";
import { LoadingSpinner } from "../components";

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<string>("Dashboard");

  if (isLoading) {
    return <LoadingSpinner message="Initializing application..." />;
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  // Admin routing
  if (
    user.role === "super_admin" ||
    user.role === "organization_owner" ||
    user.role === "hr_admin" ||
    user.role === "attendance_admin"
  ) {
    return <AdminDashboardScreen />;
  }

  // Employee screen state router
  const navigation = {
    navigate: (screen: string) => setCurrentScreen(screen),
    goBack: () => setCurrentScreen("Dashboard"),
  };

  switch (currentScreen) {
    case "CheckIn":
      return <CheckInScreen navigation={navigation} />;
    case "AttendanceHistory":
      return <AttendanceHistoryScreen navigation={navigation} />;
    case "LeaveApplication":
      return <LeaveApplicationScreen navigation={navigation} />;
    case "Dashboard":
    default:
      return <DashboardScreen navigation={navigation} />;
  }
};

export default AppNavigator;
