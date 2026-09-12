import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrganizationItem } from '../../../api/organizations';
import { organizationCardStyles as styles } from '../styles/organizationCard.styles';

interface OrganizationCardProps {
  org: OrganizationItem;
  onPress: (org: OrganizationItem) => void;
  fullLogoUrl: string | null;
  imageLoadError?: boolean;
  onImageError: (orgId: string) => void;
  onEditLimits?: (org: OrganizationItem, field?: 'admins' | 'employees') => void;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  org,
  onPress,
  fullLogoUrl,
  imageLoadError,
  onImageError,
  onEditLimits,
}) => {
  const showLogo = Boolean(fullLogoUrl && !imageLoadError);
  const addressText = [org.address_line1, org.city, org.state, org.country]
    .filter(Boolean)
    .join(', ');

  const initials = (org.code ? org.code.slice(0, 2) : org.name.slice(0, 2)).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress(org)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {showLogo ? (
            <Image
              source={{ uri: fullLogoUrl! }}
              style={styles.cardOrgLogo}
              resizeMode="cover"
              onError={() => onImageError(org.id)}
            />
          ) : (
            <View style={styles.cardLogoFallback}>
              <Text style={styles.cardLogoInitials}>{initials}</Text>
            </View>
          )}

          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.orgName}>{org.name}</Text>
            <View style={styles.metaRow}>
              <View style={styles.codePill}>
                <Text style={styles.codeText}>{org.code}</Text>
              </View>
              {org.website ? (
                <Text style={styles.orgWebsite} numberOfLines={1}>
                  {org.website.replace(/^https?:\/\//, '')}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            org.status === 'ACTIVE' ? styles.statusActive : styles.statusTrial,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              org.status === 'ACTIVE' ? styles.activeTxt : styles.trialTxt,
            ]}
          >
            {org.status}
          </Text>
        </View>
      </View>

      {/* Address Display in Card */}
      {addressText ? (
        <View style={styles.cardAddressRow}>
          <Ionicons name="location-outline" size={13} color="#64748B" />
          <Text style={styles.cardAddressText} numberOfLines={1}>
            {addressText}
          </Text>
        </View>
      ) : null}

      {/* Allocated Quotas Display - Click to edit limits */}
      <View style={styles.quotasRow}>
        <TouchableOpacity
          style={styles.quotaBox}
          activeOpacity={0.7}
          onPress={() => onEditLimits?.(org, 'admins')}
        >
          <View style={styles.quotaLabelRow}>
            <Text style={styles.quotaLabel}>Max Admins</Text>
            <Ionicons name="create-outline" size={12} color="#94A3B8" />
          </View>
          <Text style={styles.quotaVal}>{org.max_admins}</Text>
        </TouchableOpacity>
        <View style={styles.quotaDivider} />
        <TouchableOpacity
          style={styles.quotaBox}
          activeOpacity={0.7}
          onPress={() => onEditLimits?.(org, 'employees')}
        >
          <View style={styles.quotaLabelRow}>
            <Text style={styles.quotaLabel}>Workforce Seats</Text>
            <Ionicons name="create-outline" size={12} color="#94A3B8" />
          </View>
          <Text style={styles.quotaVal}>{org.max_employees}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
