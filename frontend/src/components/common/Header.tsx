import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RotatingCube } from './RotatingCube';

export interface HeaderProps {
  /** User name displayed in profile (default: "Mahendra") */
  name?: string;
  /** Role or subtitle displayed below name (default: "Administrator") */
  role?: string;
  /** Optional avatar image URI */
  avatarUri?: string;
  /** Single letter initial if no image is supplied */
  avatarInitial?: string;
  /** Optional action element rendered on the right side */
  rightAction?: React.ReactNode;
  /** Optional back button support */
  showBackButton?: boolean;
  onBackPress?: () => void;
  /** Base height of the header banner excluding top status insets (default: 86) */
  height?: number;
  /** Additional container style overrides */
  style?: StyleProp<ViewStyle>;
  /** Custom children if needed */
  children?: React.ReactNode;
  /** Whether to show the animated rotating 3D cubes (default: true) */
  showAnimatedCubes?: boolean;
}

const DEFAULT_BANNER_HEIGHT = 86;

export const Header: React.FC<HeaderProps> = ({
  name = 'Mahendra',
  role = 'Administrator',
  avatarUri,
  avatarInitial,
  rightAction,
  showBackButton = false,
  onBackPress,
  height = DEFAULT_BANNER_HEIGHT,
  style,
  children,
  showAnimatedCubes = true,
}) => {
  const safeAreaInsets = useContext(SafeAreaInsetsContext);
  const fallbackTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topInset = safeAreaInsets?.top ?? fallbackTop;
  const calculatedHeight = height + Math.max(topInset, 10);

  const initial = avatarInitial || (name ? name.charAt(0).toUpperCase() : 'M');

  return (
    <View
      style={[
        styles.outerContainer,
        {
          height: calculatedHeight,
          paddingTop: Math.max(topInset, 10),
        },
        style,
      ]}
    >
      {/* Animated 3D Isometric Cubes */}
      {showAnimatedCubes && (
        <>
          {/* Left cube rotating smoothly */}
          <RotatingCube
            size={135}
            duration={22000}
            direction="clockwise"
            style={{ left: -42, top: 4 }}
            opacity={0.88}
          />

          {/* Right cube: positioned high up ("right cubes goes up") */}
          <RotatingCube
            size={155}
            duration={26000}
            direction="counter-clockwise"
            style={{ right: -32, top: -55 }}
            opacity={0.88}
          />
        </>
      )}

      {/* Header Content Bar */}
      <View style={styles.barRow}>
        {/* Back Button (if enabled) */}
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.backButtonIconCircle}>
              <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Profile Section: Avatar Circle + Name & Role */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitialText}>{initial}</Text>
            )}
          </View>

          <View style={styles.profileTextGroup}>
            <Text style={styles.profileName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.profileRole} numberOfLines={1}>
              {role}
            </Text>
          </View>
        </View>

        {/* Right Action slot (if provided) */}
        {rightAction ? (
          <View style={styles.rightActionSlot}>{rightAction}</View>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#001C6B', // Single solid dark blue color (1 color only)
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    position: 'relative',
  },
  barRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarInitialText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#001C6B',
  },
  profileTextGroup: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 23,
  },
  profileRole: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 2,
    lineHeight: 16,
    fontWeight: '400',
  },
  rightActionSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 10,
  },
});
