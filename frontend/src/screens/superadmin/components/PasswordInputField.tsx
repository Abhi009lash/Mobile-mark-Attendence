import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { assignModalStyles as styles } from '../styles/assignAdminModal.styles';

interface PasswordInputFieldProps {
  password: string;
  onChangePassword: (pwd: string) => void;
  error?: string;
}

export const PasswordInputField: React.FC<PasswordInputFieldProps> = ({
  password,
  onChangePassword,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.fieldLabel}>
            Password <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowInfoBanner(!showInfoBanner)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={16} color="#1657DE" />
          </TouchableOpacity>
        </View>
      </View>

      {showInfoBanner && (
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#1657DE" />
          <Text style={styles.infoBannerText}>
            Password must be at least 8 characters. Login credentials will be emailed to the admin upon assignment.
          </Text>
        </View>
      )}

      <View style={[styles.passwordContainer, error && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter password (min 8 characters)"
          placeholderTextColor="#94A3B8"
          value={password}
          secureTextEntry={!showPassword}
          onChangeText={onChangePassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ padding: 4 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
