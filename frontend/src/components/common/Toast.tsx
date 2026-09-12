import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Standalone global trigger so functions outside React components can trigger toasts
let globalShowToast: ((options: ToastOptions) => void) | null = null;
let globalHideToast: (() => void) | null = null;

export const toast = {
  show: (options: ToastOptions) => globalShowToast?.(options),
  success: (message: string, title = 'Success', duration = 3500) =>
    globalShowToast?.({ type: 'success', title, message, duration }),
  error: (message: string, title = 'Error', duration = 4000) =>
    globalShowToast?.({ type: 'error', title, message, duration }),
  warning: (message: string, title = 'Warning', duration = 3500) =>
    globalShowToast?.({ type: 'warning', title, message, duration }),
  info: (message: string, title = 'Information', duration = 3500) =>
    globalShowToast?.({ type: 'info', title, message, duration }),
  hide: () => globalHideToast?.(),
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (opts) => toast.show(opts),
      hideToast: () => toast.hide(),
    };
  }
  return context;
};

const TOAST_THEMES = {
  success: {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    icon: 'checkmark-circle' as const,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    titleColor: '#14532D',
    msgColor: '#166534',
  },
  error: {
    bg: '#FEF2F2',
    border: '#FECACA',
    icon: 'alert-circle' as const,
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
    titleColor: '#991B1B',
    msgColor: '#B91C1C',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: 'warning' as const,
    iconColor: '#D97706',
    iconBg: '#FEF3F7',
    titleColor: '#92400E',
    msgColor: '#B45309',
  },
  info: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'information-circle' as const,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    titleColor: '#1E40AF',
    msgColor: '#1D4ED8',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastData, setToastData] = useState<ToastOptions | null>(null);
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastData(null);
    });
  }, [translateY, opacity, scale]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToastData(options);

      // Reset animation state
      translateY.setValue(-120);
      opacity.setValue(0);
      scale.setValue(0.92);

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 90,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options.duration ?? 3500;
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    },
    [translateY, opacity, scale, hideToast]
  );

  useEffect(() => {
    globalShowToast = showToast;
    globalHideToast = hideToast;
    return () => {
      globalShowToast = null;
      globalHideToast = null;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [showToast, hideToast]);

  const currentType = toastData?.type || 'info';
  const theme = TOAST_THEMES[currentType];

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toastData && (
        <View
          pointerEvents="box-none"
          style={[styles.portalOverlay, { top: topInset + 6 }]}
        >
          <Animated.View
            style={[
              styles.toastPill,
              {
                backgroundColor: theme.bg,
                borderColor: theme.border,
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={hideToast}
              style={styles.touchableContent}
            >
              {/* Type Icon Badge */}
              <View style={[styles.iconCircle, { backgroundColor: theme.iconBg }]}>
                <Ionicons name={theme.icon} size={20} color={theme.iconColor} />
              </View>

              {/* Text Information */}
              <View style={styles.textColumn}>
                {toastData.title ? (
                  <Text
                    style={[styles.toastTitle, { color: theme.titleColor }]}
                    numberOfLines={1}
                  >
                    {toastData.title}
                  </Text>
                ) : null}
                <Text
                  style={[styles.toastMessage, { color: theme.msgColor }]}
                  numberOfLines={3}
                >
                  {toastData.message}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={hideToast}
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={17} color="#94A3B8" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  portalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toastPill: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 12,
  },
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  toastMessage: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 17,
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
  },
});
