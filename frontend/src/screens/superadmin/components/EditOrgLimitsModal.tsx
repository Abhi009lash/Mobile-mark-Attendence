import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { organizationsApi, OrganizationItem, ApiError } from '../../../api/organizations';
import { toast } from '../../../components/common/Toast';
import { editOrgLimitsModalStyles as styles } from '../styles/editOrgLimitsModal.styles';

interface EditOrgLimitsModalProps {
  visible: boolean;
  org: OrganizationItem | null;
  initialField?: 'admins' | 'employees';
  onClose: () => void;
  onSuccess: (updatedOrg: OrganizationItem) => void;
}

export const EditOrgLimitsModal: React.FC<EditOrgLimitsModalProps> = ({
  visible,
  org,
  onClose,
  onSuccess,
}) => {
  const [maxAdmins, setMaxAdmins] = useState('1');
  const [maxEmployees, setMaxEmployees] = useState('50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      setMaxAdmins(String(org.max_admins ?? 1));
      setMaxEmployees(String(org.max_employees ?? 50));
      setError(null);
    }
  }, [org]);

  if (!org) return null;

  const handleSave = async () => {
    const parsedAdmins = parseInt(maxAdmins.trim(), 10);
    const parsedEmployees = parseInt(maxEmployees.trim(), 10);

    if (isNaN(parsedAdmins) || parsedAdmins < 1) {
      setError('Max Admins must be at least 1.');
      return;
    }
    if (isNaN(parsedEmployees) || parsedEmployees < 1) {
      setError('Workforce Seats must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await organizationsApi.updateLimits(org.id, {
        max_admins: parsedAdmins,
        max_employees: parsedEmployees,
      });
      toast.success(
        `Limits for "${org.name}" updated (${parsedAdmins} Admins, ${parsedEmployees} Workforce).`,
        'Limits Updated'
      );
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update limits. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.modalTitle}>Edit Quota Limits</Text>
              <Text style={styles.orgSubtitle} numberOfLines={1}>
                {org.name} ({org.code})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <View style={styles.formContent}>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            {/* Max Admins Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Max Admins</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  value={maxAdmins}
                  onChangeText={setMaxAdmins}
                  keyboardType="number-pad"
                  placeholder="e.g. 2"
                  placeholderTextColor="#94A3B8"
                  maxLength={5}
                />
              </View>
              <Text style={styles.hintText}>Minimum 1 administrative account allowed</Text>
            </View>

            {/* Workforce Seats Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Workforce Seats</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="people-outline" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  value={maxEmployees}
                  onChangeText={setMaxEmployees}
                  keyboardType="number-pad"
                  placeholder="e.g. 100"
                  placeholderTextColor="#94A3B8"
                  maxLength={7}
                />
              </View>
              <Text style={styles.hintText}>Minimum 1 employee seat allocation</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
