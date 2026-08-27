import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { ScreenWrapper, Input, Button, Card, Logo } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { theme } from "../../styles/theme";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      setErrorMessage(msg);
      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Logo size="large" showTagline />
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>
        <Text style={styles.cardSubtitle}>
          Enter your workforce credentials
        </Text>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Input
          label="Email Address"
          placeholder="name@company.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
          testID="login-submit-button"
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          GeoPunch SaaS • 15m Token Security • GPS Geofenced
        </Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    minHeight: "100%",
    padding: theme.spacing.lg,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.xl,
  },
  cardTitle: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  errorBanner: {
    backgroundColor: theme.colors.dangerLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorBannerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.danger,
    fontWeight: "600",
  },
  loginButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: "center",
  },
  footerText: {
    ...theme.typography.caption,
    textAlign: "center",
  },
});

export default LoginScreen;
