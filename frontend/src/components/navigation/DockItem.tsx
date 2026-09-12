import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, Platform } from 'react-native';

export interface DockItemData {
  id: string;
  icon: React.ReactNode | ((props: { isActive: boolean; size: number }) => React.ReactNode);
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export interface SpringConfig {
  mass?: number;
  stiffness?: number;
  damping?: number;
}

interface DockItemProps {
  item: DockItemData;
  isActive: boolean;
  baseSize?: number;
  magnification?: number;
  springConfig?: SpringConfig;
  showTooltip?: boolean;
}

export const DockItem: React.FC<DockItemProps> = ({
  item,
  isActive,
  baseSize = 52,
  magnification = 60,
  springConfig = { mass: 0.1, stiffness: 160, damping: 12 },
  showTooltip = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.08, friction: 4, tension: 140, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [isActive]);

  const handlePressIn = () => {
    const animations = [
      Animated.spring(scaleAnim, { toValue: 0.92, speed: 20, bounciness: 0, useNativeDriver: true }),
    ];
    if (showTooltip) {
      animations.push(Animated.timing(tooltipAnim, { toValue: 1, duration: 120, useNativeDriver: true }));
    }
    Animated.parallel(animations).start();
  };

  const handlePressOut = () => {
    const animations = [
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ];
    if (showTooltip) {
      animations.push(Animated.timing(tooltipAnim, { toValue: 0, duration: 150, useNativeDriver: true }));
    }
    Animated.parallel(animations).start();
  };

  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: magnification / baseSize,
          friction: springConfig.damping || 12,
          tension: springConfig.stiffness || 160,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
        Animated.timing(tooltipAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  };

  const iconElement =
    typeof item.icon === 'function' ? item.icon({ isActive, size: 24 }) : item.icon;

  return (
    <View style={styles.itemWrapper}>
      {/* Floating Tooltip (optional) */}
      {showTooltip && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tooltipContainer,
            {
              opacity: tooltipAnim,
              transform: [
                {
                  translateY: tooltipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.tooltipPill}>
            <Text style={styles.tooltipText}>{item.label}</Text>
          </View>
          <View style={styles.tooltipArrow} />
        </Animated.View>
      )}

      {/* Interactive Tile Button */}
      <Pressable
        onPress={item.onClick}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // @ts-ignore Web hover
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
        style={styles.pressable}
      >
        <Animated.View
          style={[
            styles.tile,
            { width: baseSize, height: baseSize, transform: [{ scale: scaleAnim }] },
            isActive ? styles.tileActive : styles.tileInactive,
          ]}
        >
          {iconElement}
          {isActive && <View style={styles.activeDot} />}
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  itemWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pressable: { alignItems: 'center', justifyContent: 'center' },
  tile: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  tileInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  tileActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1657DE',
    elevation: 3,
    shadowColor: '#1657DE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1657DE',
  },
  tooltipContainer: { position: 'absolute', top: -34, alignItems: 'center', zIndex: 999 },
  tooltipPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    elevation: 4,
  },
  tooltipText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
  },
});
