import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminItem } from '../../../api/admins';
import { getFullLogoUrl } from '../utils/logoUrl';
import { adminStyles as styles } from '../styles/adminStyles';

interface AdminCardProps {
  admin: AdminItem;
  onPressDelete: (admin: AdminItem) => void;
  onPress?: (admin: AdminItem) => void;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  admin,
  onPressDelete,
  onPress,
}) => {
  const isActive = admin.status === 'ACTIVE';
  const panX = useRef(new Animated.Value(0)).current;
  const [imageError, setImageError] = useState(false);

  const fullLogoUrl = getFullLogoUrl(admin.organization_logo_url);
  const showLogo = Boolean(fullLogoUrl && !imageError);

  const initials = admin.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          panX.setValue(Math.max(gesture.dx, -84));
        } else {
          panX.setValue(0);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -35) {
          Animated.spring(panX, {
            toValue: -84,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        } else {
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(panX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const deleteOpacity = panX.interpolate({
    inputRange: [-84, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.swipeContainer}>
      {/* Background Delete Action */}
      <Animated.View style={[styles.swipeDeleteBtn, { opacity: deleteOpacity }]}>
        <TouchableOpacity
          style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => {
            closeSwipe();
            onPressDelete(admin);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
          <Text style={styles.swipeDeleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Foreground Swipeable Card */}
      <Animated.View
        style={[styles.card, { transform: [{ translateX: panX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            closeSwipe();
            onPress?.(admin);
          }}
        >
          <View style={styles.cardTop}>
            <View style={styles.avatar}>
              {showLogo ? (
                <Image
                  source={{ uri: fullLogoUrl! }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={styles.avatarText}>{initials || 'AD'}</Text>
              )}
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.adminName} numberOfLines={1}>
                {admin.full_name}
              </Text>
              <Text style={styles.adminEmail} numberOfLines={1}>
                {admin.email}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusBadgeActive : styles.statusBadgeSuspended,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  isActive ? styles.statusDotActive : styles.statusDotSuspended,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  isActive ? styles.statusTextActive : styles.statusTextSuspended,
                ]}
              >
                {admin.status}
              </Text>
            </View>
          </View>

          {/* Organization badge */}
          <View style={styles.orgPillRow}>
            <Text style={styles.orgCode}>{admin.organization_code || 'ORG'}</Text>
            <Text style={styles.orgName} numberOfLines={1}>
              {admin.organization_name || 'Assigned Organization'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
