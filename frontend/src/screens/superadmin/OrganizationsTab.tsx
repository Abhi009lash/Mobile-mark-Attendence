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
import { getFullLogoUrl } from './utils/logoUrl';
import { useOrganizations } from './hooks/useOrganizations';
import { OrganizationCard } from './components/OrganizationCard';
import { OrganizationsListSkeleton } from './components/OrganizationsListSkeleton';
import { PaginationBar } from './components/PaginationBar';
import { ProvisionOrgModal } from './components/ProvisionOrgModal';
import { DeleteOrgModal } from './components/DeleteOrgModal';
import { EditOrgLimitsModal } from './components/EditOrgLimitsModal';
import { EditOrgModal } from './components/EditOrgModal';
import { organizationsTabStyles as styles } from './styles/organizationsTab.styles';

export const OrganizationsTab: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const orgState = useOrganizations(scrollViewRef);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <View style={styles.container}>
      {/* Screen Title & Add Button */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Organizations</Text>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={orgState.refreshing}
            onRefresh={orgState.onRefresh}
            colors={['#1657DE']}
            tintColor="#1657DE"
          />
        }
      >
        {/* Search Filter */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by company name or code..."
            placeholderTextColor="#94A3B8"
            value={orgState.search}
            onChangeText={orgState.setSearch}
          />
          {orgState.search ? (
            <TouchableOpacity onPress={orgState.handleClearSearch}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Tip banner */}
        <View style={styles.helperTipRow}>
          <Ionicons name="information-circle-outline" size={14} color="#64748B" />
          <Text style={styles.helperTipText}>
            Tip: Tap card to edit organization. Double-tap to delete.
          </Text>
        </View>

        {(orgState.loading && orgState.orgs.length === 0) || orgState.isFetchingPage ? (
          <OrganizationsListSkeleton count={Math.min(orgState.pageSize, 4)} />
        ) : orgState.orgs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="archive-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Organizations Found</Text>
            <Text style={styles.emptySubtitle}>
              {orgState.search
                ? `No company tenants match "${orgState.search}".`
                : 'No company tenants registered yet. Tap "New" above to provision your first organization.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {orgState.orgs.map((org) => (
              <OrganizationCard
                key={org.id}
                org={org}
                onPress={orgState.handleCardPress}
                onEditLimits={orgState.handleOpenEditLimits}
                fullLogoUrl={getFullLogoUrl(org.logo_url)}
                imageLoadError={orgState.imageLoadErrors[org.id]}
                onImageError={(id) =>
                  orgState.setImageLoadErrors((prev) => ({ ...prev, [id]: true }))
                }
              />
            ))}
          </View>
        )}

        {/* Pagination Bar - Appears only when page limit ends (totalPages > 1) */}
        {!orgState.loading && orgState.orgs.length > 0 && orgState.totalPages > 1 && (
          <PaginationBar
            page={orgState.page}
            totalPages={orgState.totalPages}
            onPageChange={orgState.handlePageChange}
          />
        )}
      </ScrollView>

      {/* Provision Organization Modal */}
      <ProvisionOrgModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={orgState.handleCreateSuccess}
      />

      {/* Edit Quota Limits Modal */}
      <EditOrgLimitsModal
        visible={!!orgState.orgToEditLimits}
        org={orgState.orgToEditLimits}
        initialField={orgState.initialLimitsField}
        onClose={() => orgState.setOrgToEditLimits(null)}
        onSuccess={orgState.handleUpdateLimitsSuccess}
      />

      {/* Edit Organization Modal (Single-click on card) */}
      <EditOrgModal
        visible={!!orgState.orgToEdit}
        org={orgState.orgToEdit}
        onClose={() => orgState.setOrgToEdit(null)}
        onSuccess={orgState.handleUpdateOrgSuccess}
      />

      {/* Delete Confirmation Alert Card Modal */}
      <DeleteOrgModal
        visible={!!orgState.orgToDelete}
        org={orgState.orgToDelete}
        isDeleting={orgState.isDeleting}
        deleteError={orgState.deleteError}
        onConfirm={orgState.handleConfirmDelete}
        onCancel={() => {
          orgState.setOrgToDelete(null);
          orgState.setDeleteError(null);
        }}
      />
    </View>
  );
};
