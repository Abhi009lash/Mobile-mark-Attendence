import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { authApi, UserProfile, ApiError } from '../../api/auth';

interface LoginScreenProps {
  onNavigateToForgotPassword?: () => void;
  onLoginSuccess?: (user: UserProfile, accessToken: string, refreshToken: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToForgotPassword,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const targetEmail = (loginEmail || email).trim();
    const targetPassword = loginPassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await authApi.login(targetEmail, targetPassword);
      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.access_token, data.refresh_token);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Network connection error. Ensure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image source={require('../../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Geopoint account</Text>
        </View>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={(val) => { setEmail(val); setErrorMessage(null); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={(val) => { setPassword(val); setErrorMessage(null); }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.forgotPasswordRow}>
            <TouchableOpacity onPress={onNavigateToForgotPassword} style={styles.forgotPasswordBtn}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={() => handleLogin()}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            By signing in, you agree to our{' '}
            <Text style={styles.legalLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 84, height: 84, borderRadius: 20, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  errorBox: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 16 },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '500' },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0F172A', marginBottom: 16, backgroundColor: '#F8FAFC' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordRow: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -6 },
  forgotPasswordBtn: { paddingVertical: 4 },
  forgotPasswordText: { color: '#1657DE', fontSize: 13, fontWeight: '600' },
  loginButton: { backgroundColor: '#1657DE', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  legalSection: { marginTop: 32, alignItems: 'center', paddingHorizontal: 16 },
  legalText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
  legalLink: { color: '#1657DE', fontWeight: '600' },
});
