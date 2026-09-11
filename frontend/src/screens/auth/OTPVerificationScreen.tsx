import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { authApi, ApiError } from '../../api/auth';

interface OTPVerificationScreenProps {
  email: string;
  initialOtp?: string;
  onBack: () => void;
  onOtpVerified: (resetToken: string) => void;
}

export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  email,
  initialOtp,
  onBack,
  onOtpVerified,
}) => {
  const [otp, setOtp] = useState(initialOtp || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(
    initialOtp ? `Dev Mode verification code pre-filled: ${initialOtp}` : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    const trimmedOtp = otp.trim();
    if (trimmedOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      const data = await authApi.verifyOtp(email.trim(), trimmedOtp);
      onOtpVerified(data.reset_token);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Network error. Check connection or backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      const data = await authApi.forgotPassword(email.trim());
      if (data.dev_otp) {
        setOtp(data.dev_otp);
        setResendNotice(`New verification code pre-filled: ${data.dev_otp}`);
      } else {
        setResendNotice('A new 6-digit code has been dispatched.');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Network error while resending code.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Change Email</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit verification code to <Text style={styles.emailHighlight}>{email}</Text>.
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {resendNotice && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{resendNotice}</Text>
            </View>
          )}

          <Text style={styles.label}>6-Digit OTP</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            placeholderTextColor="#94A3B8"
            value={otp}
            onChangeText={(val) => {
              setOtp(val.replace(/[^0-9]/g, '').slice(0, 6));
              setErrorMessage(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Verify Code</Text>}
          </TouchableOpacity>

          <View style={styles.resendSection}>
            <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
              <Text style={styles.resendBtnText}>
                {resending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backButton: { alignSelf: 'flex-start', marginBottom: 32, paddingVertical: 6, paddingHorizontal: 2 },
  backButtonText: { color: '#1657DE', fontSize: 14, fontWeight: '600' },
  content: { width: '100%' },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', lineHeight: 21, marginBottom: 24 },
  emailHighlight: { color: '#0F172A', fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  otpInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 10,
    textAlign: 'center',
    color: '#0F172A',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  primaryBtn: {
    backgroundColor: '#1657DE',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendPrompt: { fontSize: 13, color: '#64748B' },
  resendBtnText: { color: '#1657DE', fontSize: 13, fontWeight: '700' },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '500' },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  successText: { color: '#16A34A', fontSize: 13, fontWeight: '500' },
});
