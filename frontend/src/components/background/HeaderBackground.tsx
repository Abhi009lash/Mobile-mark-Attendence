import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';

interface HeaderBackgroundProps {
  children?: React.ReactNode;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_HEIGHT = 86;

export const HeaderBackground: React.FC<HeaderBackgroundProps> = ({
  children,
  height = DEFAULT_HEIGHT,
  style,
}) => {
  return (
    <View style={[styles.container, { height }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#001C6B', // Single solid dark blue color
  },
});
