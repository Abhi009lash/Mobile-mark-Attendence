export const colors = {
  primary: "#2563EB",       // Vibrant Blue
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",
  secondary: "#475569",     // Slate
  secondaryLight: "#F1F5F9",
  background: "#F8FAFC",    // Clean light background
  surface: "#FFFFFF",       // Card / Modal background
  text: "#0F172A",          // Dark charcoal for main text
  textSecondary: "#64748B", // Muted text
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  borderFocus: "#3B82F6",
  
  // Status Colors
  success: "#16A34A",       // Green (Present / Approved)
  successLight: "#DCFCE7",
  warning: "#D97706",       // Amber (Late / Pending)
  warningLight: "#FEF3C7",
  danger: "#DC2626",        // Red (Absent / Rejected / Error)
  dangerLight: "#FEE2E2",
  info: "#0284C7",
  infoLight: "#E0F2FE",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: "700" as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: "600" as const, color: colors.text },
  bodyLarge: { fontSize: 16, fontWeight: "400" as const, color: colors.text },
  bodyMedium: { fontSize: 14, fontWeight: "400" as const, color: colors.text },
  bodySmall: { fontSize: 12, fontWeight: "400" as const, color: colors.textSecondary },
  button: { fontSize: 16, fontWeight: "600" as const },
  caption: { fontSize: 11, fontWeight: "500" as const, color: colors.textMuted },
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export default theme;
