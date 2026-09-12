import React from 'react';
import { View } from 'react-native';
import { OrganizationCardSkeleton } from './OrganizationCardSkeleton';
import { organizationsTabStyles as styles } from '../styles/organizationsTab.styles';

interface OrganizationsListSkeletonProps {
  count?: number;
}

export const OrganizationsListSkeleton: React.FC<OrganizationsListSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <OrganizationCardSkeleton key={`org-skeleton-${index}`} />
      ))}
    </View>
  );
};
