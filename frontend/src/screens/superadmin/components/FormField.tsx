import React from 'react';
import { View, Text, TextInput, KeyboardTypeOptions } from 'react-native';
import { provisionOrgModalStyles as styles } from '../styles/provisionOrgModal.styles';

interface FormFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>
      {label} {required ? <Text style={styles.reqStar}>*</Text> : null}
    </Text>
    <TextInput
      style={[styles.input, error && styles.inputError, !editable && styles.inputDisabled]}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      editable={editable}
    />
    {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
  </View>
);
