import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  organizationsApi,
  OrganizationItem,
  OrganizationCreatePayload,
  ApiError,
} from '../../api/organizations';
import { API_BASE_URL } from '../../api/auth';

export const OrganizationsTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [orgs, setOrgs] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [maxAdmins, setMaxAdmins] = useState('2');
  const [maxEmployees, setMaxEmployees] = useState('50');
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const getFullLogoUrl = (logoUrl?: string | null): string | null => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:')) {
      return logoUrl;
    }
    let baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      const h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1') {
        baseUrl = 'http://localhost:8000';
      } else if (h) {
        baseUrl = `http://${h}:8000`;
      }
    }
    const cleanPath = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
    return `${baseUrl}${cleanPath}`;
  };

  const fetchOrganizations = useCallback(async () => {
    try {
      const data = await organizationsApi.list();
      setOrgs(data.items || []);
    } catch {
      // Backend might be offline or empty, keep existing list
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Auto-generate code suggestion as user types organization name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code === name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()) {
      const autoCode = val
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 4)
        .toUpperCase();
      setCode(autoCode);
    }
  };

  const handlePickLogo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow gallery access to select an organization logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLogoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Image Error', 'Could not open image picker.');
    }
  };

  const handleRemoveLogo = () => {
    setLogoUri(null);
  };

  const resetForm = () => {
    setName('');
    setWebsite('');
    setLogoUri(null);
    setCode('');
    setEmail('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setStateVal('');
    setPostalCode('');
    setCountry('India');
    setMaxAdmins('2');
    setMaxEmployees('50');
    setFormError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    resetForm();
  };

  const handleCreateOrganization = async () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedWebsite = website.trim();

    // Required Field Validations (Red Star fields)
    if (!trimmedName) {
      setFormError('Organization name is required.');
      return;
    }
    if (!trimmedEmail) {
      setFormError('Contact / Admin email is required.');
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const parsedAdmins = parseInt(maxAdmins.trim(), 10);
    if (!maxAdmins.trim() || isNaN(parsedAdmins) || parsedAdmins < 1) {
      setFormError('Max Admins is required and must be at least 1.');
      return;
    }

    const parsedEmployees = parseInt(maxEmployees.trim(), 10);
    if (!maxEmployees.trim() || isNaN(parsedEmployees) || parsedEmployees < 1) {
      setFormError('Workforce Seats is required and must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Upload logo if an image was picked
      let uploadedLogoUrl: string | undefined = undefined;
      if (logoUri) {
        try {
          const filename = logoUri.split('/').pop()?.split('?')[0] || 'logo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          uploadedLogoUrl = await organizationsApi.uploadLogo(logoUri, type, filename);
        } catch (uploadErr: unknown) {
          const msg = uploadErr instanceof Error ? uploadErr.message : 'Failed to upload logo.';
          setFormError(`Logo upload failed: ${msg}`);
          setIsSubmitting(false);
          return;
        }
      }

      const payload: OrganizationCreatePayload = {
        name: trimmedName,
        code: trimmedCode || undefined,
        website: trimmedWebsite || undefined,
        logo_url: uploadedLogoUrl || undefined,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        address_line1: addressLine1.trim() || undefined,
        address_line2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: stateVal.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        country: country.trim() || 'India',
        max_admins: parsedAdmins,
        max_employees: parsedEmployees,
      };

      const newOrg = await organizationsApi.create(payload);

      // Prepend newly created organization into state
      setOrgs((prev) => [newOrg, ...prev]);

      setShowModal(false);
      resetForm();

      Alert.alert(
        'Organization Created',
        `"${newOrg.name}" (${newOrg.code}) has been provisioned successfully.`
      );
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create organization. Check connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Screen Title & Add Button */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Organizations</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={handleOpenModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1657DE']}
            tintColor="#1657DE"
          />
        }
      >
        {/* Search Filter */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by company name or code..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1657DE" />
            <Text style={styles.loadingText}>Loading organizations...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="archive-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Organizations Found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? `No company tenants match "${search}".`
                : 'No company tenants registered yet. Tap "New" above to provision your first organization.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((org) => {
              const fullLogo = getFullLogoUrl(org.logo_url);
              const showLogo = Boolean(fullLogo && !imageLoadErrors[org.id]);
              const addressText = [org.address_line1, org.city, org.state, org.country]
                .filter(Boolean)
                .join(', ');

              return (
                <View key={org.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      {showLogo ? (
                        <Image
                          source={{ uri: fullLogo! }}
                          style={styles.cardOrgLogo}
                          resizeMode="cover"
                          onError={() => {
                            setImageLoadErrors((prev) => ({ ...prev, [org.id]: true }));
                          }}
                        />
                      ) : (
                        <View style={styles.cardLogoFallback}>
                          <Text style={styles.cardLogoInitials}>
                            {(org.code ? org.code.slice(0, 2) : org.name.slice(0, 2)).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.orgName}>{org.name}</Text>
                        <View style={styles.metaRow}>
                          <View style={styles.codePill}>
                            <Text style={styles.codeText}>{org.code}</Text>
                          </View>
                          {org.website ? (
                            <Text style={styles.orgWebsite} numberOfLines={1}>
                              {org.website.replace(/^https?:\/\//, '')}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        org.status === 'ACTIVE' ? styles.statusActive : styles.statusTrial,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          org.status === 'ACTIVE' ? styles.activeTxt : styles.trialTxt,
                        ]}
                      >
                        {org.status}
                      </Text>
                    </View>
                  </View>

                  {/* Address Display in Card */}
                  {addressText ? (
                    <View style={styles.cardAddressRow}>
                      <Ionicons name="location-outline" size={13} color="#64748B" />
                      <Text style={styles.cardAddressText} numberOfLines={1}>
                        {addressText}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.quotasRow}>
                    <View style={styles.quotaBox}>
                      <Text style={styles.quotaLabel}>Admins</Text>
                      <Text style={styles.quotaVal}>
                        {org.current_admins ?? 0} / {org.max_admins}
                      </Text>
                    </View>
                    <View style={styles.quotaDivider} />
                    <View style={styles.quotaBox}>
                      <Text style={styles.quotaLabel}>Workforce Seats</Text>
                      <Text style={styles.quotaVal}>
                        {org.current_employees ?? 0} / {org.max_employees}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Provision Organization Card Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Provision Organization</Text>
                <Text style={styles.modalSubtitle}>Configure tenant parameters & limits</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleCloseModal}
                disabled={isSubmitting}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {formError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            {/* Form ScrollView */}
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              {/* Organization Name (Required) */}
              <Text style={styles.inputLabel}>
                Organization Name <Text style={styles.reqStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Acme Corporation"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={handleNameChange}
                autoFocus
              />

              {/* Organization Logo (Optional) */}
              <Text style={styles.inputLabel}>Organization Logo</Text>
              <View style={styles.logoPickerContainer}>
                {logoUri ? (
                  <View style={styles.logoPreviewWrapper}>
                    <Image source={{ uri: logoUri }} style={styles.logoPreviewImage} />
                    <TouchableOpacity
                      style={styles.removeLogoCircle}
                      onPress={handleRemoveLogo}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.logoPlaceholderCircle}>
                    <Ionicons name="business-outline" size={22} color="#94A3B8" />
                  </View>
                )}
                <View style={styles.logoPickerActionCol}>
                  <TouchableOpacity
                    style={styles.uploadLogoBtn}
                    activeOpacity={0.8}
                    onPress={handlePickLogo}
                  >
                    <Ionicons
                      name={logoUri ? 'sync-outline' : 'cloud-upload-outline'}
                      size={15}
                      color="#1657DE"
                    />
                    <Text style={styles.uploadLogoBtnText}>
                      {logoUri ? 'Change Logo' : 'Upload Logo'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.logoHintText}>PNG or JPG recommended</Text>
                </View>
              </View>

              {/* Website URL & Organization Code (Optional) */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1.4 }}>
                  <Text style={styles.inputLabel}>Website URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://company.com"
                    placeholderTextColor="#94A3B8"
                    value={website}
                    onChangeText={setWebsite}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Organization Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ACME"
                    placeholderTextColor="#94A3B8"
                    value={code}
                    onChangeText={(val) => setCode(val.toUpperCase())}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Admin Email (Required) */}
              <Text style={styles.inputLabel}>
                Contact / Admin Email <Text style={styles.reqStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="contact@acme.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Phone */}
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              {/* Location & Address Section */}
              <Text style={styles.inputLabel}>Street Address Line 1</Text>
              <TextInput
                style={styles.input}
                placeholder="Building, street, or landmark"
                placeholderTextColor="#94A3B8"
                value={addressLine1}
                onChangeText={setAddressLine1}
              />

              <Text style={styles.inputLabel}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                placeholder="Suite, unit, floor"
                placeholderTextColor="#94A3B8"
                value={addressLine2}
                onChangeText={setAddressLine2}
              />

              {/* City & State Row */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Hyderabad"
                    placeholderTextColor="#94A3B8"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Telangana"
                    placeholderTextColor="#94A3B8"
                    value={stateVal}
                    onChangeText={setStateVal}
                  />
                </View>
              </View>

              {/* Postal Code & Country Row */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Postal / PIN Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="500081"
                    placeholderTextColor="#94A3B8"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Country</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="India"
                    placeholderTextColor="#94A3B8"
                    value={country}
                    onChangeText={setCountry}
                  />
                </View>
              </View>

              {/* Quotas: Max Admins & Workforce Seats (REQUIRED) */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>
                    Max Admins <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2"
                    placeholderTextColor="#94A3B8"
                    value={maxAdmins}
                    onChangeText={setMaxAdmins}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>
                    Workforce Seats <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50"
                    placeholderTextColor="#94A3B8"
                    value={maxEmployees}
                    onChangeText={setMaxEmployees}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCloseModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleCreateOrganization}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContainer: { flex: 1 },
  contentContainer: { padding: 16, paddingTop: 8, paddingBottom: 110 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1657DE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 19, paddingHorizontal: 16 },
  list: { gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  cardOrgLogo: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  cardLogoFallback: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  cardLogoInitials: { fontSize: 14, fontWeight: '800', color: '#1657DE' },
  orgName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  orgWebsite: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  codePill: { backgroundColor: '#F1F5F9', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  codeText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusTrial: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 11, fontWeight: '700' },
  activeTxt: { color: '#15803D' },
  trialTxt: { color: '#B45309' },
  cardAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  cardAddressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  quotasRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 10, padding: 8, alignItems: 'center' },
  quotaBox: { flex: 1, alignItems: 'center' },
  quotaLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  quotaVal: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  quotaDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },

  // Modal Card Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  formScroll: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  reqStar: {
    color: '#DC2626',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  logoPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoPreviewWrapper: {
    position: 'relative',
  },
  logoPreviewImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#1657DE',
  },
  removeLogoCircle: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  logoPlaceholderCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPickerActionCol: {
    flex: 1,
    gap: 4,
  },
  uploadLogoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  uploadLogoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1657DE',
  },
  logoHintText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1657DE',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
