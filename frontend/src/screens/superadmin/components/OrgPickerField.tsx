import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrganizationItem } from '../../../api/organizations';
import { assignModalStyles as styles } from '../styles/assignAdminModal.styles';

interface OrgPickerFieldProps {
  organizations: OrganizationItem[];
  selectedOrg: OrganizationItem | null;
  onSelectOrg: (org: OrganizationItem | null) => void;
  loading: boolean;
  isQuotaFull: boolean;
  error?: string;
}

export const OrgPickerField: React.FC<OrgPickerFieldProps> = ({
  organizations,
  selectedOrg,
  onSelectOrg,
  loading,
  isQuotaFull,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const trimmedQuery = searchQuery.trim();
  const hasQuery = trimmedQuery.length > 0;
  const filtered = hasQuery
    ? organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          org.code.toLowerCase().includes(trimmedQuery.toLowerCase())
      )
    : [];

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>
          Organization <Text style={styles.requiredStar}>*</Text>
        </Text>
      </View>

      {selectedOrg ? (
        <View>
          <View style={[styles.selectedOrgCard, error && styles.inputError]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedOrgName}>
                {selectedOrg.name} ({selectedOrg.code})
              </Text>
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                {selectedOrg.current_admins}/{selectedOrg.max_admins} admins allocated
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changeOrgBtn}
              onPress={() => onSelectOrg(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.changeOrgText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.quotaChip, isQuotaFull && styles.quotaChipFull]}>
            <Ionicons
              name={isQuotaFull ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              size={14}
              color={isQuotaFull ? '#DC2626' : '#16A34A'}
            />
            <Text style={[styles.quotaText, isQuotaFull && styles.quotaTextFull]}>
              {isQuotaFull
                ? `Quota Reached: ${selectedOrg.current_admins}/${selectedOrg.max_admins} admins allocated.`
                : `Quota Available: ${selectedOrg.current_admins}/${selectedOrg.max_admins} admins used.`}
            </Text>
          </View>
        </View>
      ) : (
        <View>
          <View style={[styles.searchBox, error && styles.inputError]}>
            <Ionicons name="search-outline" size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder={
                loading
                  ? 'Loading organizations...'
                  : 'Type to search organization...'
              }
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Suggestions ONLY show when user has actively typed a query */}
          {hasQuery &&
            (filtered.length > 0 ? (
              <View style={styles.orgListDropdown}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 140 }}>
                  {filtered.map((org) => {
                    const full = (org.current_admins ?? 0) >= (org.max_admins ?? 1);
                    return (
                      <TouchableOpacity
                        key={org.id}
                        style={styles.orgOption}
                        onPress={() => {
                          onSelectOrg(org);
                          setSearchQuery('');
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, color: '#0F172A', fontWeight: '700' }}>
                            {org.name} <Text style={{ color: '#1657DE' }}>({org.code})</Text>
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: full ? '#DC2626' : '#15803D',
                          }}
                        >
                          {full ? 'Quota Full' : `${org.current_admins}/${org.max_admins} seats`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              <View style={{ paddingVertical: 8, paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                  No organizations found matching "{searchQuery}".
                </Text>
              </View>
            ))}
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
