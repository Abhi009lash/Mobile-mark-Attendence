import React from 'react';
import {
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  Platform,
  useWindowDimensions,
  DimensionValue,
} from 'react-native';
import { DockItem, DockItemData, SpringConfig } from './DockItem';

export interface DockProps {
  items: DockItemData[];
  activeId?: string;
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  spring?: SpringConfig;
  width?: DimensionValue;
  containerStyle?: StyleProp<ViewStyle>;
  /** Whether to show floating tooltips on press/hover (default: false) */
  showTooltips?: boolean;
}

export const Dock: React.FC<DockProps> = ({
  items = [],
  activeId,
  panelHeight = 72,
  baseItemSize = 52,
  magnification = 62,
  spring = { mass: 0.1, stiffness: 160, damping: 12 },
  width,
  containerStyle,
  showTooltips = false,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  // Standard floating bar width: 92% of screen, capped at 390px
  const calculatedWidth = width ?? Math.min(screenWidth - 32, 390);

  return (
    <View style={styles.dockRoot} pointerEvents="box-none">
      <View
        style={[
          styles.dockPanel,
          {
            width: calculatedWidth,
            height: panelHeight,
          },
          containerStyle,
        ]}
      >
        {items.map((item) => {
          const isActive = activeId !== undefined ? activeId === item.id : Boolean(item.isActive);
          return (
            <DockItem
              key={item.id}
              item={item}
              isActive={isActive}
              baseSize={baseItemSize}
              magnification={magnification}
              springConfig={spring}
              showTooltip={showTooltips}
            />
          );
        })}
      </View>
    </View>
  );
};

export { DockItemData, SpringConfig };

const styles = StyleSheet.create({
  dockRoot: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  dockPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    // Smooth elevation & drop shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
});
