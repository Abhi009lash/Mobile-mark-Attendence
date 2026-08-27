import { Dimensions, PixelRatio, Platform, StatusBar } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Standard base guideline resolution (density-independent base)
const baseWidth = 375;
const baseHeight = 812;

/**
 * Scales a size based on screen width.
 */
export const scale = (size: number): number => {
  return Math.round((SCREEN_WIDTH / baseWidth) * size);
};

/**
 * Scales a size based on screen height.
 */
export const verticalScale = (size: number): number => {
  return Math.round((SCREEN_HEIGHT / baseHeight) * size);
};

/**
 * Moderately scales a size with a damping factor (default 0.5).
 * Ideal for font sizes, padding, and icons so they don't get overly large on tablets
 * or overly small on smaller Android handsets.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return Math.round(size + (scale(size) - size) * factor);
};

/**
 * Returns a width calculated as a percentage of screen width.
 */
export const widthPercentage = (percentage: number): number => {
  return Math.round((SCREEN_WIDTH * percentage) / 100);
};

/**
 * Returns a height calculated as a percentage of screen height.
 */
export const heightPercentage = (percentage: number): number => {
  return Math.round((SCREEN_HEIGHT * percentage) / 100);
};

export const isSmallDevice = SCREEN_WIDTH < 360;
export const isTablet = SCREEN_WIDTH >= 768;

export { SCREEN_WIDTH, SCREEN_HEIGHT };
