import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface RotatingCubeProps {
  /** Size in pixels (width and height of the bounding square) */
  size?: number;
  /** Rotation duration in milliseconds */
  duration?: number;
  /** Direction of rotation */
  direction?: 'clockwise' | 'counter-clockwise';
  /** Additional container style overrides (e.g. absolute positioning) */
  style?: StyleProp<ViewStyle>;
  /** Opacity of the cube */
  opacity?: number;
}

export const RotatingCube: React.FC<RotatingCubeProps> = ({
  size = 140,
  duration = 20000,
  direction = 'clockwise',
  style,
  opacity = 0.9,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [rotateAnim, duration]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'clockwise' ? ['0deg', '360deg'] : ['360deg', '0deg'],
  });

  // Calculate geometric isometric cube paths scaled to `size`
  // Center is at (cx, cy) = (size/2, size/2)
  const cx = size / 2;
  const cy = size / 2;
  const S = size * 0.38; // Radius of outer vertices
  const W = S * Math.cos((30 * Math.PI) / 180); // ~S * 0.866
  const H = S * Math.sin((30 * Math.PI) / 180); // ~S * 0.5
  const k = 0.54; // Inner cutout ratio (thickness)

  // 6 Outer Vertices of isometric projection:
  const V0 = [cx, cy - S];
  const V1 = [cx + W, cy - H];
  const V2 = [cx + W, cy + H];
  const V3 = [cx, cy + S];
  const V4 = [cx - W, cy + H];
  const V5 = [cx - W, cy - H];
  const C = [cx, cy];

  const makeFacePath = (outerPts: number[][]) => {
    const mx = outerPts.reduce((acc, p) => acc + p[0], 0) / outerPts.length;
    const my = outerPts.reduce((acc, p) => acc + p[1], 0) / outerPts.length;
    const innerPts = outerPts.map((p) => [mx + k * (p[0] - mx), my + k * (p[1] - my)]);

    return (
      `M ${outerPts[0][0].toFixed(1)} ${outerPts[0][1].toFixed(1)} ` +
      `L ${outerPts[1][0].toFixed(1)} ${outerPts[1][1].toFixed(1)} ` +
      `L ${outerPts[2][0].toFixed(1)} ${outerPts[2][1].toFixed(1)} ` +
      `L ${outerPts[3][0].toFixed(1)} ${outerPts[3][1].toFixed(1)} Z ` +
      `M ${innerPts[0][0].toFixed(1)} ${innerPts[0][1].toFixed(1)} ` +
      `L ${innerPts[3][0].toFixed(1)} ${innerPts[3][1].toFixed(1)} ` +
      `L ${innerPts[2][0].toFixed(1)} ${innerPts[2][1].toFixed(1)} ` +
      `L ${innerPts[1][0].toFixed(1)} ${innerPts[1][1].toFixed(1)} Z`
    );
  };

  const topPath = makeFacePath([V0, V1, C, V5]);
  const leftPath = makeFacePath([C, V5, V4, V3]);
  const rightPath = makeFacePath([C, V1, V2, V3]);

  // Unique gradient IDs to prevent collision if multiple cubes render
  const idPrefix = direction === 'clockwise' ? 'cw' : 'ccw';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity,
          transform: [{ rotate: spin }],
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Top Face Gradient: highlights with white to vibrant royal blue */}
          <LinearGradient id={`${idPrefix}_top`} x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#0543CA" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#477BDE" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </LinearGradient>

          {/* Left Face Gradient: deep shadow navy blue */}
          <LinearGradient id={`${idPrefix}_left`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#001C6B" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#0543CA" stopOpacity="0.9" />
          </LinearGradient>

          {/* Right Face Gradient: mid-tone royal blue with cyan/sky glow */}
          <LinearGradient id={`${idPrefix}_right`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0543CA" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.95" />
          </LinearGradient>
        </Defs>

        {/* Isometric Hollow Faces with evenodd cutout */}
        <Path fill={`url(#${idPrefix}_left)`} fillRule="evenodd" d={leftPath} />
        <Path fill={`url(#${idPrefix}_right)`} fillRule="evenodd" d={rightPath} />
        <Path fill={`url(#${idPrefix}_top)`} fillRule="evenodd" d={topPath} />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
