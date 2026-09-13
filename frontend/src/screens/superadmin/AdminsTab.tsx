import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminItem } from '../../api/admins';
import { useAdmins } from './hooks/useAdmins';
import { AdminCard } from './components/AdminCard';
import { AdminCardSkeleton } from './components/AdminCardSkeleton';
import { AssignAdminModal } from './components/AssignAdminModal';
import { DeleteAdminModal } from './components/DeleteAdminModal';
import { EditAdminStatusModal } from './components/EditAdminStatusModal';
import { PaginationBar } from './components/PaginationBar';
import { adminsTabStyles as styles } from './styles/adminsTab.styles';

export const AdminsTab: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    admins,
    loading,
    refreshing,
    isFetchingPage,
    search,
    setSearch,
    page,
    totalPages,
    handlePageChange,
    handleRefresh,
    deleteAdmin,
    addAdminToList,
    updateAdminInList,
  } = useAdmins(scrollViewRef);

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [adminToEditStatus, setAdminToEditStatus] = useState<AdminItem | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      setIsDeleting(true);
      await deleteAdmin(adminToDelete);
      setAdminToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {/* Screen Header */}
        <View style={styles.screenHeader}>
          <View>
            <Text style={styles.platformBadge}>ORGANIZATION ACCESS</Text>
            <Text style={styles.screenTitle}>Admins</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAssignModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Assign Admin</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or org..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Admins List / Skeletons / Empty State */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1657DE"
            />
          }
        >
          {(loading && admins.length === 0) || isFetchingPage ? (
            <View style={styles.list}>
              <AdminCardSkeleton />
              <AdminCardSkeleton />
              <AdminCardSkeleton />
            </View>
          ) : admins.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="person-circle-outline" size={40} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>
                {search ? 'No Matching Admins' : 'No Admins Assigned'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? `No administrators found matching "${search}".`
                  : 'No attendance administrators have been provisioned yet. Tap "Assign Admin" above to select an organization and appoint an admin.'}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {admins.map((admin) => (
                <AdminCard
                  key={admin.id}
                  admin={admin}
                  onPress={(a) => setAdminToEditStatus(a)}
                  onPressDelete={(a) => setAdminToDelete(a)}
                />
              ))}
            </View>
          )}

          {/* Pagination Bar - Appears only when page limit ends (totalPages > 1) */}
          {!loading && admins.length > 0 && totalPages > 1 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </ScrollView>
      </View>

      {/* Assign Admin Modal */}
      <AssignAdminModal
        visible={assignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        onAdminCreated={addAdminToList}
      />

      {/* Edit Admin Status Modal (Single-click on Admin Card) */}
      <EditAdminStatusModal
        visible={!!adminToEditStatus}
        admin={adminToEditStatus}
        onClose={() => setAdminToEditStatus(null)}
        onStatusUpdated={(updated) => {
          updateAdminInList(updated);
          setAdminToEditStatus(null);
        }}
      />

      {/* Delete Admin Confirmation Alert Card */}
      <DeleteAdminModal
        visible={!!adminToDelete}
        admin={adminToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAdminToDelete(null)}
      />
    </View>
  );
};
