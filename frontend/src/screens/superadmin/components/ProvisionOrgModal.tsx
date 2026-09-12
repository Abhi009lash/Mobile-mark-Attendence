import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormField } from './FormField';
import { OrgLogoPicker } from './OrgLogoPicker';
import { OrgAddressFields } from './OrgAddressFields';
import { useProvisionOrgForm } from '../hooks/useProvisionOrgForm';
import { provisionOrgModalStyles as styles } from '../styles/provisionOrgModal.styles';

interface ProvisionOrgModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProvisionOrgModal: React.FC<ProvisionOrgModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const form = useProvisionOrgForm(onSuccess, onClose);

  const handleClose = () => {
    if (form.isSubmitting) return;
    form.resetForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Provision Organization</Text>
              <Text style={styles.modalSubtitle}>Configure tenant parameters & limits</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} disabled={form.isSubmitting}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {form.formError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorBannerText}>{form.formError}</Text>
            </View>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            <FormField
              label="Organization Name"
              required
              placeholder="e.g. Acme Corporation"
              value={form.name}
              onChangeText={form.handleNameChange}
              error={form.fieldErrors.name}
            />

            <OrgLogoPicker
              logoUri={form.logoUri}
              onLogoSelected={form.setLogo}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Website URL"
                  placeholder="e.g. acme.com"
                  value={form.website}
                  onChangeText={form.setField(form.setWebsite, 'website')}
                  error={form.fieldErrors.website}
                  keyboardType="url"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Organization Code"
                  placeholder="e.g. ACME"
                  value={form.code}
                  onChangeText={form.setField(form.setCode, 'code')}
                  error={form.fieldErrors.code}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <FormField
              label="Contact / Admin Email"
              required
              placeholder="admin@company.com"
              value={form.email}
              onChangeText={form.setField(form.setEmail, 'email')}
              error={form.fieldErrors.email}
              keyboardType="email-address"
            />

            <FormField
              label="Phone"
              placeholder="+91-9876543210"
              value={form.phone}
              onChangeText={form.setField(form.setPhone, 'phone')}
              error={form.fieldErrors.phone}
              keyboardType="phone-pad"
            />

            <OrgAddressFields
              addressLine1={form.addressLine1}
              setAddressLine1={form.setAddressLine1}
              addressLine2={form.addressLine2}
              setAddressLine2={form.setAddressLine2}
              city={form.city}
              setCity={form.setCity}
              stateVal={form.stateVal}
              setStateVal={form.setStateVal}
              postalCode={form.postalCode}
              setPostalCode={form.setField(form.setPostalCode, 'postalCode')}
              postalCodeError={form.fieldErrors.postalCode}
              country={form.country}
              setCountry={form.setCountry}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Max Admins"
                  required
                  placeholder="e.g. 2"
                  value={form.maxAdmins}
                  onChangeText={form.setField(form.setMaxAdmins, 'maxAdmins')}
                  error={form.fieldErrors.maxAdmins}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Workforce Seats"
                  required
                  placeholder="e.g. 50"
                  value={form.maxEmployees}
                  onChangeText={form.setField(form.setMaxEmployees, 'maxEmployees')}
                  error={form.fieldErrors.maxEmployees}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={form.isSubmitting}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, form.isSubmitting && styles.submitBtnDisabled]}
              onPress={form.handleSubmit}
              disabled={form.isSubmitting}
              activeOpacity={0.85}
            >
              {form.isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Create Organization</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
