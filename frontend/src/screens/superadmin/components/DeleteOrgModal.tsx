import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrganizationItem } from '../../../api/organizations';
import { deleteOrgModalStyles as styles } from '../styles/deleteOrgModal.styles';

interface DeleteOrgModalProps {
  visible: boolean;
  org: OrganizationItem | null;
  isDeleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteOrgModal: React.FC<DeleteOrgModalProps> = ({
  visible,
  org,
  isDeleting,
  deleteError,
  onConfirm,
  onCancel,
}) => {
  if (!visible || !org) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <View style={styles.deleteModalBackdrop}>
        <View style={styles.deleteModalCard}>
          {/* Warning Icon Circle */}
          <View style={styles.deleteIconCircle}>
            <Ionicons name="trash-outline" size={28} color="#DC2626" />
          </View>

          <Text style={styles.deleteModalTitle}>Delete Organization?</Text>
          <Text style={styles.deleteModalMessage}>
            Are you sure you want to delete{' '}
            <Text style={{ fontWeight: '700', color: '#0F172A' }}>
              "{org.name}"
            </Text>{' '}
            ({org.code})?
          </Text>
          <Text style={styles.deleteModalWarning}>
            This will permanently remove the tenant, administrative users, employee records, and data. This action cannot be undone.
          </Text>

          {deleteError ? (
            <View style={styles.deleteErrorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.deleteErrorText}>{deleteError}</Text>
            </View>
          ) : null}

          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              style={styles.deleteCancelBtn}
              onPress={onCancel}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteCancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteConfirmBtn, isDeleting && styles.deleteBtnDisabled]}
              onPress={onConfirm}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash" size={16} color="#FFFFFF" />
                  <Text style={styles.deleteConfirmBtnText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
