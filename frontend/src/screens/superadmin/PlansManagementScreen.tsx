import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { ScreenWrapper, Header, Card, Button } from "../../components";
import { theme } from "../../styles/theme";

export interface PlansManagementScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const DEFAULT_PLANS = [
  { id: 1, name: "Starter Tier", price: "$29/mo", employees: "25 Employees", locations: "2 Locations" },
  { id: 2, name: "Business Tier", price: "$99/mo", employees: "100 Employees", locations: "10 Locations" },
  { id: 3, name: "Enterprise Tier", price: "$299/mo", employees: "1000 Employees", locations: "50 Locations" },
];

export const PlansManagementScreen: React.FC<PlansManagementScreenProps> = ({
  navigation,
}) => {
  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <Header title="SaaS Subscription Plans" onBack={() => navigation.goBack()} />

      <FlatList
        data={DEFAULT_PLANS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
            <Text style={styles.detail}>• {item.employees}</Text>
            <Text style={styles.detail}>• {item.locations}</Text>
            <Text style={styles.detail}>• GPS Geofencing + Offline Sync Included</Text>
          </Card>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  name: {
    ...theme.typography.bodyMedium,
    fontWeight: "700",
    color: theme.colors.text,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  detail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});

export default PlansManagementScreen;
