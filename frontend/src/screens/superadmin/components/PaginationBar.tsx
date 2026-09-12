import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paginationStyles as styles } from '../styles/pagination.styles';

export interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  pageSize?: number;
  totalCount?: number;
  displayCount?: number;
  onPageSizeChange?: (newSize: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <View style={styles.paginationBar}>
      {/* Left: Prev Button */}
      <TouchableOpacity
        style={[styles.navBtn, isFirstPage && styles.navBtnDisabled]}
        onPress={() => onPageChange(page - 1)}
        disabled={isFirstPage}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-back"
          size={16}
          color={isFirstPage ? '#94A3B8' : '#1657DE'}
        />
        <Text style={[styles.navBtnText, isFirstPage && styles.navBtnTextDisabled]}>
          Prev
        </Text>
      </TouchableOpacity>

      {/* Middle: The page number with blue bubble */}
      <View style={styles.pageCenterWrapper}>
        <View style={styles.pageBubble}>
          <Text style={styles.pageBubbleText}>{page}</Text>
        </View>
        <Text style={styles.pageTotalText}>/ {totalPages}</Text>
      </View>

      {/* Right: Next Button */}
      <TouchableOpacity
        style={[styles.navBtn, isLastPage && styles.navBtnDisabled]}
        onPress={() => onPageChange(page + 1)}
        disabled={isLastPage}
        activeOpacity={0.7}
      >
        <Text style={[styles.navBtnText, isLastPage && styles.navBtnTextDisabled]}>
          Next
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isLastPage ? '#94A3B8' : '#1657DE'}
        />
      </TouchableOpacity>
    </View>
  );
};
