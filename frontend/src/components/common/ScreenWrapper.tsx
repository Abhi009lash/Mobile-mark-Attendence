import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";

export interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  statusBarColor?: string;
  barStyle?: "light-content" | "dark-content";
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  statusBarColor = theme.colors.background,
  barStyle = "dark-content",
}) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={["top", "left", "right", "bottom"]}>
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle={barStyle}
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.staticContent, contentContainerStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  staticContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
});

export default ScreenWrapper;
