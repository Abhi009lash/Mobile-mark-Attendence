import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, SafeAreaView, Dimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { OTPVerificationScreen } from './src/screens/auth/OTPVerificationScreen';
import { ResetPasswordScreen } from './src/screens/auth/ResetPasswordScreen';
import { LogoutScreen, AuthenticatedUser } from './src/screens/auth/LogoutScreen';
import { SuperAdminShell } from './src/screens/superadmin/SuperAdminShell';
import { tokenStorage } from './src/services/storage/tokenStorage';
import { onSessionExpired } from './src/api/auth';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.8, 320);

type AuthScreen = 'login' | 'forgot_password' | 'otp_verification' | 'reset_password' | 'logout' | 'superadmin';

export default function App(): React.JSX.Element {
  const [showLogo, setShowLogo] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);

  useEffect(() => {
    onSessionExpired(() => {
      setCurrentUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setCurrentScreen('login');
    });

    const restoreSession = async () => {
      try {
        const storedUser = await tokenStorage.getStoredUser();
        const storedRefresh = await tokenStorage.getRefreshToken();
        const storedAccess = await tokenStorage.getAccessToken();

        if (storedUser && storedRefresh) {
          setCurrentUser(storedUser);
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
          if (storedUser.role === 'SUPER_ADMIN') {
            setCurrentScreen('superadmin');
          } else {
            setCurrentScreen('logout');
          }
        }
      } catch {
        // Fallback to login
      }
    };

    restoreSession();

    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'forgot_password':
        return (
          <ForgotPasswordScreen
            onBackToLogin={() => setCurrentScreen('login')}
            onOtpSent={(email, hintOtp) => {
              setResetEmail(email);
              setDevOtp(hintOtp || undefined);
              setCurrentScreen('otp_verification');
            }}
          />
        );
      case 'otp_verification':
        return (
          <OTPVerificationScreen
            email={resetEmail}
            initialOtp={devOtp}
            onBack={() => setCurrentScreen('forgot_password')}
            onOtpVerified={(token) => {
              setResetToken(token);
              setDevOtp(undefined);
              setCurrentScreen('reset_password');
            }}
          />
        );
      case 'reset_password':
        return (
          <ResetPasswordScreen
            resetToken={resetToken}
            onBackToLogin={() => setCurrentScreen('login')}
            onResetSuccess={() => {
              setResetEmail('');
              setResetToken('');
              setCurrentScreen('login');
            }}
          />
        );
      case 'superadmin':
        return (
          <SuperAdminShell
            user={currentUser}
            onLogout={async () => {
              await tokenStorage.clearSession();
              setCurrentUser(null);
              setAccessToken(null);
              setRefreshToken(null);
              setCurrentScreen('login');
            }}
          />
        );
      case 'logout':
        if (currentUser) {
          return (
            <LogoutScreen
              user={currentUser}
              accessToken={accessToken}
              onLogoutSuccess={() => {
                setCurrentUser(null);
                setAccessToken(null);
                setRefreshToken(null);
                setCurrentScreen('login');
              }}
            />
          );
        }
        return (
          <LoginScreen
            onNavigateToForgotPassword={() => setCurrentScreen('forgot_password')}
            onLoginSuccess={(user, token, rToken) => {
              setCurrentUser(user);
              setAccessToken(token);
              setRefreshToken(rToken);
              if (user.role === 'SUPER_ADMIN') {
                setCurrentScreen('superadmin');
              } else {
                setCurrentScreen('logout');
              }
            }}
          />
        );
      case 'login':
      default:
        return (
          <LoginScreen
            onNavigateToForgotPassword={() => setCurrentScreen('forgot_password')}
            onLoginSuccess={(user, token, rToken) => {
              setCurrentUser(user);
              setAccessToken(token);
              setRefreshToken(rToken);
              if (user.role === 'SUPER_ADMIN') {
                setCurrentScreen('superadmin');
              } else {
                setCurrentScreen('logout');
              }
            }}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      {!showLogo ? (
        currentScreen === 'superadmin' ? (
          <View style={styles.darkAppContainer}>
            <StatusBar style="light" />
            {renderScreen()}
          </View>
        ) : (
          <SafeAreaView style={styles.appContainer}>
            <StatusBar style="dark" />
            {renderScreen()}
          </SafeAreaView>
        )
      ) : (
        <SafeAreaView style={styles.container}>
          <Image
            source={require('./assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <StatusBar style="dark" />
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkAppContainer: {
    flex: 1,
    backgroundColor: '#001C6B',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
