import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminItem } from '../../../api/admins';
import { deleteAdminStyles as styles } from '../styles/deleteAdminModal.styles';

interface DeleteAdminModalProps {
  visible: boolean;
  admin: AdminItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteAdminModal: React.FC<DeleteAdminModalProps> = ({
  visible,
  admin,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!visible || !admin) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Warning Trash Icon Circle */}
          <View style={styles.iconCircle}>
            <Ionicons name="trash-outline" size={28} color="#DC2626" />
          </View>

          <Text style={styles.title}>Decommission Admin?</Text>
          <Text style={styles.message}>
            Are you sure you want to remove{' '}
            <Text style={{ fontWeight: '700', color: '#0F172A' }}>
              "{admin.full_name}"
            </Text>{' '}
            ({admin.email}) from{' '}
            <Text style={{ fontWeight: '700', color: '#1657DE' }}>
              {admin.organization_name || 'Organization'}
            </Text>
            ?
          </Text>

          {/* Business Logic Warning */}
          <View style={styles.warningPill}>
            <Ionicons name="information-circle" size={16} color="#DC2626" />
            <Text style={styles.warningText}>
              Frees up 1 seat in the organization's allocated admin quota. The administrator will immediately lose all platform access.
            </Text>
          </View>

          {/* Symmetrical Actions (Cancel on LEFT, Delete on RIGHT) */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, isDeleting && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash" size={16} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
