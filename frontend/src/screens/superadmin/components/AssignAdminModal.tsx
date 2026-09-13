import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { organizationsApi, OrganizationItem } from '../../../api/organizations';
import { adminsApi, AdminItem } from '../../../api/admins';
import { toast } from '../../../components/common/Toast';
import { OrgPickerField } from './OrgPickerField';
import { PasswordInputField } from './PasswordInputField';
import { FormErrors, validateAdminForm } from '../utils/adminValidation';
import { assignModalStyles as styles } from '../styles/assignAdminModal.styles';

interface AssignAdminModalProps {
  visible: boolean;
  onClose: () => void;
  onAdminCreated: (admin: AdminItem) => void;
}

export const AssignAdminModal: React.FC<AssignAdminModalProps> = ({
  visible,
  onClose,
  onAdminCreated,
}) => {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationItem | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadOrganizations();
      setPassword('');
      setSelectedOrg(null);
      setErrors({});
    } else {
      resetForm();
    }
  }, [visible]);

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const res = await organizationsApi.list({ status: 'ACTIVE', page_size: 100 });
      setOrganizations(res.items);
    } catch {
      toast.error('Failed to load organizations.');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const resetForm = () => {
    setSelectedOrg(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setErrors({});
  };

  const isQuotaFull = selectedOrg
    ? (selectedOrg.current_admins ?? 0) >= (selectedOrg.max_admins ?? 1)
    : false;

  const handleSubmit = async () => {
    const validationErrors = validateAdminForm(
      selectedOrg?.id,
      isQuotaFull,
      fullName,
      email,
      password
    );

    if (Object.keys(validationErrors).length > 0 || !selectedOrg) {
      setErrors(validationErrors);
      toast.error('Please resolve the validation errors.');
      return;
    }

    try {
      setSubmitting(true);
      const newAdmin = await adminsApi.create(selectedOrg.id, {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      toast.success(`Admin provisioned & credentials emailed to ${email.trim()}!`);
      onAdminCreated(newAdmin);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to assign admin.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Assign Admin</Text>
              <Text style={styles.modalSubtitle}>
                Provision administrator and send login credentials
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Searchable Organization Field (no suggestions when empty) */}
            <OrgPickerField
              organizations={organizations}
              selectedOrg={selectedOrg}
              onSelectOrg={(org) => {
                setSelectedOrg(org);
                if (errors.org) setErrors((prev) => ({ ...prev, org: undefined }));
              }}
              loading={loadingOrgs}
              isQuotaFull={isQuotaFull}
              error={errors.org}
            />

            {/* Admin Full Name */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  Admin Full Name <Text style={styles.requiredStar}>*</Text>
                </Text>
              </View>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="e.g. Jane Doe"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            {/* Admin Email */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>
                  Login Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
              </View>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="e.g. jane.doe@company.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Clean Password with Info Icon & Eye Toggle (empty initially) */}
            <PasswordInputField
              password={password}
              onChangePassword={(t) => {
                setPassword(t);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
            />
          </ScrollView>

          {/* Symmetrical Footer (Cancel on LEFT, Submit on RIGHT) */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (submitting || isQuotaFull) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || isQuotaFull}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="mail-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Assign & Send</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
