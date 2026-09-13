import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminsApi, AdminItem } from '../../../api/admins';
import { getFullLogoUrl } from '../utils/logoUrl';
import { toast } from '../../../components/common/Toast';
import { editAdminStatusStyles as styles } from '../styles/editAdminStatusModal.styles';

interface EditAdminStatusModalProps {
  visible: boolean;
  admin: AdminItem | null;
  onClose: () => void;
  onStatusUpdated: (updatedAdmin: AdminItem) => void;
}

export const EditAdminStatusModal: React.FC<EditAdminStatusModalProps> = ({
  visible,
  admin,
  onClose,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (admin) {
      setSelectedStatus(admin.status);
      setImageError(false);
    }
  }, [admin, visible]);

  if (!visible || !admin) return null;

  const fullLogoUrl = getFullLogoUrl(admin.organization_logo_url);
  const showLogo = Boolean(fullLogoUrl && !imageError);

  const initials = admin.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    if (selectedStatus === admin.status) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      const updated = await adminsApi.updateStatus(admin.id, selectedStatus);
      toast.success(`Admin '${admin.full_name}' is now ${selectedStatus.toLowerCase()}.`);
      onStatusUpdated(updated);
      onClose();
    } catch {
      toast.error(`Failed to update status for ${admin.full_name}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!loading) onClose();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Update Admin Status</Text>
              <Text style={styles.subtitle}>Configure platform authorization and login access</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Admin Profile Row */}
          <View style={styles.adminProfileRow}>
            <View style={styles.avatar}>
              {showLogo ? (
                <Image
                  source={{ uri: fullLogoUrl! }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={styles.avatarText}>{initials || 'AD'}</Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.adminName} numberOfLines={1}>
                {admin.full_name}
              </Text>
              <Text style={styles.adminEmail} numberOfLines={1}>
                {admin.email}
              </Text>
            </View>
          </View>

          {/* Status Selection */}
          <Text style={styles.sectionLabel}>Select Account Status</Text>
          <View style={styles.statusOptionsRow}>
            <TouchableOpacity
              style={[
                styles.statusOption,
                selectedStatus === 'ACTIVE' && styles.statusOptionActiveSelected,
              ]}
              onPress={() => setSelectedStatus('ACTIVE')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={selectedStatus === 'ACTIVE' ? '#16A34A' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.statusOptionText,
                  selectedStatus === 'ACTIVE' && styles.statusOptionTextActive,
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusOption,
                selectedStatus === 'SUSPENDED' && styles.statusOptionSuspendedSelected,
              ]}
              onPress={() => setSelectedStatus('SUSPENDED')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pause-circle"
                size={18}
                color={selectedStatus === 'SUSPENDED' ? '#DC2626' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.statusOptionText,
                  selectedStatus === 'SUSPENDED' && styles.statusOptionTextSuspended,
                ]}
              >
                Suspended
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Explanation */}
          <View
            style={[
              styles.infoBox,
              selectedStatus === 'ACTIVE' ? styles.infoBoxActive : styles.infoBoxSuspended,
            ]}
          >
            <Ionicons
              name={selectedStatus === 'ACTIVE' ? 'shield-checkmark' : 'alert-circle'}
              size={18}
              color={selectedStatus === 'ACTIVE' ? '#16A34A' : '#DC2626'}
            />
            <Text
              style={
                selectedStatus === 'ACTIVE'
                  ? styles.infoTextActive
                  : styles.infoTextSuspended
              }
            >
              {selectedStatus === 'ACTIVE'
                ? 'Admin can log in and manage organization attendance, employees, and settings.'
                : 'Suspending invalidates all active JWT sessions immediately. The admin cannot sign in.'}
            </Text>
          </View>

          {/* Symmetrical Actions (Cancel on LEFT, Save on RIGHT) */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Update Status</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
