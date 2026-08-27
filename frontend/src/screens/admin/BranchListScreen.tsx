import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { ScreenWrapper, Header, Card, StatusBadge, LoadingSpinner, EmptyState } from "../../components";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface Branch {
  id: number;
  name: string;
  address?: string;
  status: string;
}

export interface BranchListScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const BranchListScreen: React.FC<BranchListScreenProps> = ({ navigation }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Branch[]>("/branches");
      setBranches(response.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Branches"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "Refresh",
          onPress: fetchBranches,
        }}
      />

      {loading ? (
        <LoadingSpinner message="Loading branches..." />
      ) : branches.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="No Branches Configured"
          description="Create your first organization branch."
        />
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.branchCard}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <StatusBadge status={item.status} />
              </View>
              {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
            </Card>
          )}
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
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  branchCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  address: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});

export default BranchListScreen;
