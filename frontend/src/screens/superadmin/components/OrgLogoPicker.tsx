import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { toast } from '../../../components/common/Toast';
import { provisionOrgModalStyles as styles } from '../styles/provisionOrgModal.styles';

interface OrgLogoPickerProps {
  logoUri: string | null;
  onLogoSelected: (uri: string, base64: string | null) => void;
  existingLogoUrl?: string | null;
}

export const OrgLogoPicker: React.FC<OrgLogoPickerProps> = ({
  logoUri,
  onLogoSelected,
  existingLogoUrl,
}) => {
  const displayUri = logoUri || existingLogoUrl;

  const handlePickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Data = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : null;
        onLogoSelected(asset.uri, base64Data);
      }
    } catch {
      toast.error('Could not access image library.', 'Permission Error');
    }
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Organization Logo</Text>
      <TouchableOpacity
        style={styles.logoUploadBox}
        onPress={handlePickLogo}
        activeOpacity={0.8}
      >
        {displayUri ? (
          <View style={styles.logoPreviewContainer}>
            <Image source={{ uri: displayUri }} style={styles.logoPreview} resizeMode="contain" />
            <View style={styles.logoActionOverlay}>
              <View style={styles.logoActionBtn}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
                <Text style={styles.logoActionBtnText}>Change</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.logoPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={26} color="#1657DE" />
            <Text style={styles.logoPlaceholderText}>Tap to upload logo</Text>
            <Text style={styles.logoPlaceholderSub}>PNG, JPG, or WebP</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
