import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/common/Skeleton';
import { organizationCardStyles as styles } from '../styles/organizationCard.styles';

export const OrganizationCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Skeleton width={44} height={44} borderRadius={10} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="55%" height={16} borderRadius={4} />
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Skeleton width={48} height={14} borderRadius={4} />
              <Skeleton width={90} height={14} borderRadius={4} />
            </View>
          </View>
        </View>
        <Skeleton width={54} height={20} borderRadius={6} />
      </View>

      {/* Address line placeholder */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 }}>
        <Skeleton width={14} height={14} borderRadius={7} />
        <Skeleton width="68%" height={12} borderRadius={4} />
      </View>

      {/* Quotas row placeholder */}
      <View style={styles.quotasRow}>
        <View style={[styles.quotaBox, { gap: 4 }]}>
          <Skeleton width={54} height={10} borderRadius={3} />
          <Skeleton width={28} height={14} borderRadius={4} />
        </View>
        <View style={styles.quotaDivider} />
        <View style={[styles.quotaBox, { gap: 4 }]}>
          <Skeleton width={80} height={10} borderRadius={3} />
          <Skeleton width={32} height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};
