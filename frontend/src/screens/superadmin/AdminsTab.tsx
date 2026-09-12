import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminItem {
  id: string;
  name: string;
  email: string;
  officeName: string;
  orgName: string;
  radiusMeters: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export const AdminsTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [admins] = useState<AdminItem[]>([]);

  const filtered = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.officeName.toLowerCase().includes(search.toLowerCase()) ||
      a.orgName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Office Admins</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
          <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Assign</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search admin or office..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="person-circle-outline" size={38} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Office Admins</Text>
            <Text style={styles.emptySubtitle}>
              No office administrators have been provisioned yet. Tap "Assign" above to configure an office admin.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((admin) => (
              <View key={admin.id} style={styles.card}>
                <View style={styles.topRow}>
                  <Ionicons name="person-circle-outline" size={28} color="#1657DE" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminName}>{admin.name}</Text>
                    <Text style={styles.adminEmail}>{admin.email}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{admin.status}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>{admin.orgName}</Text>
                  <Text style={styles.officeHighlight}>{admin.officeName}</Text>
                </View>

                <View style={styles.geofencePill}>
                  <Ionicons name="navigate-circle-outline" size={14} color="#16A34A" />
                  <Text style={styles.geofenceText}>Radius: {admin.radiusMeters}m geofence</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1657DE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 19, paddingHorizontal: 16 },
  list: { gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  adminName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  adminEmail: { fontSize: 12, color: '#64748B', marginTop: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  detailText: { fontSize: 12, color: '#64748B' },
  officeHighlight: { fontSize: 12, color: '#1657DE', fontWeight: '600' },
  geofencePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4, marginTop: 4 },
  geofenceText: { fontSize: 11, fontWeight: '600', color: '#166534' },
});
