import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Header, Input, LoadingSpinner, EmptyState, CreateOrgModal, OrgItemCard } from "../../components";
import { OrgItem } from "../../components/superadmin/OrgItemCard";
import { theme } from "../../styles/theme";
import apiClient from "../../api/client";

export interface OrganizationDirectoryScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const OrganizationDirectoryScreen: React.FC<OrganizationDirectoryScreenProps> = ({
  navigation,
}) => {
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<OrgItem[]>("/organizations");
      setOrgs(res.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleToggleStatus = async (org: OrgItem) => {
    const newStatus = org.status === "active" ? "suspended" : "active";
    try {
      await apiClient.put(`/organizations/${org.id}`, { status: newStatus });
      Alert.alert("Status Updated", `${org.name} is now ${newStatus}.`);
      fetchOrgs();
    } catch {
      Alert.alert("Error", "Failed to update organization status.");
    }
  };

  const handleDelete = (org: OrgItem) => {
    Alert.alert(
      "Delete Organization",
      `Are you sure you want to permanently delete ${org.name}? This will remove all its branches, employees, and records.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/organizations/${org.id}`);
              Alert.alert("Deleted", `${org.name} has been removed.`);
              fetchOrgs();
            } catch {
              Alert.alert("Error", "Failed to delete organization.");
            }
          },
        },
      ]
    );
  };

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header
        title="Customer Organizations"
        onBack={() => navigation.goBack()}
        rightAction={{
          label: "+ Onboard",
          onPress: () => setShowCreateModal(true),
        }}
      />

      <View style={styles.searchBar}>
        <Input
          placeholder="Search by company name or email..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchInput}
        />
      </View>

      {loading ? (
        <LoadingSpinner message="Loading organizations..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="No Organizations Found"
          description={search ? "No matching organizations found." : "No organizations onboarded yet."}
          actionLabel="+ Onboard Organization"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <OrgItemCard
              item={item}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {showCreateModal && (
        <CreateOrgModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchOrgs}
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

export default OrganizationDirectoryScreen;
