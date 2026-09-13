import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '../../../components/common/Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* 1. KPI Cards Row Skeleton */}
      <View style={styles.kpiRow}>
        {[1, 2, 3].map((key) => (
          <View key={`kpi-skel-${key}`} style={styles.kpiCard}>
            <View style={styles.topRow}>
              <Skeleton width={32} height={32} borderRadius={8} />
              <Skeleton width={38} height={10} borderRadius={4} />
            </View>
            <Skeleton width="60%" height={24} borderRadius={6} style={{ marginTop: 8 }} />
            <Skeleton width="80%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>

      {/* 2. Area Chart Card Skeleton */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={{ gap: 6 }}>
            <Skeleton width={140} height={16} borderRadius={4} />
            <Skeleton width={180} height={12} borderRadius={4} />
          </View>
          <Skeleton width={160} height={28} borderRadius={8} />
        </View>
        <Skeleton width="100%" height={160} borderRadius={12} style={{ marginTop: 12 }} />
        <View style={styles.labelsRow}>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Skeleton key={`lbl-skel-${idx}`} width={30} height={10} borderRadius={3} />
          ))}
        </View>
      </View>

      {/* 3. Donut Status Chart Card Skeleton */}
      <View style={styles.sectionCard}>
        <View style={{ gap: 6, marginBottom: 16 }}>
          <Skeleton width={150} height={16} borderRadius={4} />
          <Skeleton width={120} height={12} borderRadius={4} />
        </View>
        <View style={styles.donutRow}>
          <Skeleton width={140} height={140} borderRadius={70} />
          <View style={styles.legendCol}>
            {[1, 2, 3].map((lIdx) => (
              <View key={`lgd-skel-${lIdx}`} style={styles.legendRow}>
                <Skeleton width={10} height={10} borderRadius={5} />
                <View style={{ gap: 4 }}>
                  <Skeleton width={60} height={12} borderRadius={3} />
                  <Skeleton width={80} height={13} borderRadius={3} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  legendCol: {
    gap: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
