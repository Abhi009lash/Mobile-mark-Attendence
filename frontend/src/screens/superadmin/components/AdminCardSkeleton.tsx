import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/common/Skeleton';
import { adminStyles as styles } from '../styles/adminStyles';

export const AdminCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={[styles.cardInfo, { gap: 6, marginLeft: 12 }]}>
          <Skeleton width="45%" height={16} borderRadius={4} />
          <Skeleton width="65%" height={13} borderRadius={4} />
        </View>
        <Skeleton width={60} height={22} borderRadius={8} />
      </View>

      <View style={styles.orgPillRow}>
        <Skeleton width={50} height={18} borderRadius={4} />
        <Skeleton width="60%" height={14} borderRadius={4} />
      </View>
    </View>
  );
};
