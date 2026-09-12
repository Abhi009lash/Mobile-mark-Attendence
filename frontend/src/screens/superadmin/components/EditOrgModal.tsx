import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrganizationItem } from '../../../api/organizations';
import { FormField } from './FormField';
import { OrgLogoPicker } from './OrgLogoPicker';
import { OrgAddressFields } from './OrgAddressFields';
import { getFullLogoUrl } from '../utils/logoUrl';
import { useEditOrgForm } from '../hooks/useEditOrgForm';
import { editOrgModalStyles as styles } from '../styles/editOrgModal.styles';

interface EditOrgModalProps {
  visible: boolean;
  org: OrganizationItem | null;
  onClose: () => void;
  onSuccess: (updated: OrganizationItem) => void;
}

export const EditOrgModal: React.FC<EditOrgModalProps> = ({
  visible,
  org,
  onClose,
  onSuccess,
}) => {
  const form = useEditOrgForm(org, onClose, onSuccess);

  if (!org) return null;

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
            <View>
              <Text style={styles.title}>Edit Organization</Text>
              <Text style={styles.subtitle}>{org.name} ({org.code})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Body */}
          <ScrollView
            style={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {form.submitError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.errorBannerText}>{form.submitError}</Text>
              </View>
            )}

            {/* Status Selection */}
            <Text style={styles.sectionTitle}>Account Status</Text>
            <View style={styles.statusRow}>
              <TouchableOpacity
                style={[
                  styles.statusPill,
                  form.status === 'ACTIVE' && styles.statusActiveSelected,
                ]}
                onPress={() => form.setStatus('ACTIVE')}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    form.status === 'ACTIVE' && styles.statusActiveTextSelected,
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusPill,
                  form.status === 'TRIAL' && styles.statusTrialSelected,
                ]}
                onPress={() => form.setStatus('TRIAL')}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    form.status === 'TRIAL' && styles.statusTrialTextSelected,
                  ]}
                >
                  Trial
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusPill,
                  form.status === 'SUSPENDED' && styles.statusSuspendedSelected,
                ]}
                onPress={() => form.setStatus('SUSPENDED')}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    form.status === 'SUSPENDED' && styles.statusSuspendedTextSelected,
                  ]}
                >
                  Suspended
                </Text>
              </TouchableOpacity>
            </View>

            {/* Logo Picker */}
            <Text style={styles.sectionTitle}>Brand Logo</Text>
            <OrgLogoPicker
              logoUri={form.logoUri}
              existingLogoUrl={getFullLogoUrl(form.existingLogoUrl)}
              onLogoSelected={form.handleLogoPicked}
            />

            {/* General Info */}
            <Text style={styles.sectionTitle}>General Information</Text>
            <FormField
              label="Company Name"
              value={form.name}
              onChangeText={form.setName}
              placeholder="e.g. Acme Corporation"
              error={form.errors.name}
              required
            />

            <FormField
              label="Organization Code"
              value={form.code}
              onChangeText={(t) => form.setCode(t.toUpperCase())}
              placeholder="e.g. ACME"
              error={form.errors.code}
              autoCapitalize="characters"
              required
            />

            <FormField
              label="Website"
              value={form.website}
              onChangeText={form.setWebsite}
              placeholder="https://acme.com"
              keyboardType="url"
            />

            <FormField
              label="Phone Number"
              value={form.phone}
              onChangeText={form.setPhone}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
            />

            {/* Modular Address Fields */}
            <OrgAddressFields
              addressLine1={form.addressLine1}
              setAddressLine1={form.setAddressLine1}
              addressLine2={form.addressLine2}
              setAddressLine2={form.setAddressLine2}
              city={form.city}
              setCity={form.setCity}
              stateVal={form.state}
              setStateVal={form.setState}
              country={form.country}
              setCountry={form.setCountry}
              postalCode={form.postalCode}
              setPostalCode={form.setPostalCode}
            />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={form.isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, form.isSubmitting && styles.saveBtnDisabled]}
              onPress={form.handleSubmit}
              disabled={form.isSubmitting}
              activeOpacity={0.85}
            >
              {form.isSubmitting ? (
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
