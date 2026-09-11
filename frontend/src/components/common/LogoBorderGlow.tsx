import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface LogoBorderGlowProps {
  children: React.ReactNode;
  size?: number;
  borderRadius?: number;
  glowColor?: string;
  accentColor?: string;
}

export const LogoBorderGlow: React.FC<LogoBorderGlowProps> = ({
  children,
  size = 180,
  borderRadius = 36,
  glowColor = '#1657DE',
  accentColor = '#00D2A0',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.85,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.04,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim, scaleAnim]);

  return (
    <View style={[styles.wrapper, { width: size + 20, height: size + 20 }]}>
      {/* Outer Breathing Glow Halo */}
      <Animated.View
        style={[
          styles.glowHalo,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: borderRadius + 8,
            backgroundColor: glowColor,
            opacity: pulseAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Inner Precision Border Ring */}
      <View
        style={[
          styles.borderRing,
          {
            width: size + 6,
            height: size + 6,
            borderRadius: borderRadius + 3,
            borderColor: accentColor,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    shadowColor: '#1657DE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  borderRing: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1657DE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
});
