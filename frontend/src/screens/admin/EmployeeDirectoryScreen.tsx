import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, Input, Button, LoadingSpinner, EmptyState, EmployeeItemCard } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";
import { EmployeeProfile } from "../../types";

export interface EmployeeDirectoryScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const EmployeeDirectoryScreen: React.FC<EmployeeDirectoryScreenProps> = ({
  navigation,
}) => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<EmployeeProfile[]>("/employees");
      setEmployees(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      (e.designation && e.designation.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Employee Directory"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchEmployees,
        }}
      />

      <View style={styles.searchBar}>
        <Input
          placeholder="Search by code or designation..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchInput}
        />
      </View>

      {loading ? (
        <LoadingSpinner message="Loading employee directory..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Employees Found"
          description={search ? "No matching employees." : "No staff members registered."}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <EmployeeItemCard employee={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  searchBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  list: {
    padding: theme.spacing.lg,
  },
});

export default EmployeeDirectoryScreen;
