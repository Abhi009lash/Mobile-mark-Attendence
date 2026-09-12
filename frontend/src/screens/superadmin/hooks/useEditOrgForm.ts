import { useState, useEffect } from 'react';
import { organizationsApi, OrganizationItem, OrganizationUpdatePayload, ApiError } from '../../../api/organizations';
import { toast } from '../../../components/common/Toast';

export const useEditOrgForm = (
  org: OrganizationItem | null,
  onClose: () => void,
  onSuccess: (updated: OrganizationItem) => void
) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'TRIAL' | 'SUSPENDED'>('ACTIVE');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoMimeType, setLogoMimeType] = useState('image/png');
  const [logoFileName, setLogoFileName] = useState('org_logo.png');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      setName(org.name || '');
      setCode(org.code || '');
      setWebsite(org.website || '');
      setPhone(org.phone || '');
      setStatus(org.status === 'CANCELLED' ? 'SUSPENDED' : org.status);
      setAddressLine1(org.address_line1 || '');
      setAddressLine2(org.address_line2 || '');
      setCity(org.city || '');
      setState(org.state || '');
      setCountry(org.country || 'India');
      setPostalCode(org.postal_code || '');
      setLogoUri(null);
      setLogoBase64(null);
      setErrors({});
      setSubmitError(null);
    }
  }, [org]);

  const handleLogoPicked = (uri: string, base64: string | null) => {
    setLogoUri(uri);
    setLogoBase64(base64);
  };

  const handleRemoveLogo = () => {
    setLogoUri(null);
    setLogoBase64(null);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Organization name must be at least 2 characters.';
    }
    if (!code.trim() || code.trim().length < 2) {
      errs.code = 'Organization code must be at least 2 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!org) return;
    if (!validate()) {
      toast.error('Please resolve the highlighted validation errors.', 'Validation Failed');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let finalLogoUrl: string | undefined = org.logo_url || undefined;
      if (logoBase64 || logoUri) {
        finalLogoUrl = await organizationsApi.uploadLogo({
          imageUri: logoUri || undefined,
          base64: logoBase64 || undefined,
          mimeType: logoMimeType,
          fileName: logoFileName,
        });
      }

      const payload: OrganizationUpdatePayload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        status,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        logo_url: finalLogoUrl,
        address_line1: addressLine1.trim() || undefined,
        address_line2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
      };

      const updated = await organizationsApi.update(org.id, payload);
      toast.success(`Organization "${updated.name}" updated successfully.`, 'Changes Saved');
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to update organization. Please check network.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name, setName,
    code, setCode,
    website, setWebsite,
    phone, setPhone,
    status, setStatus,
    addressLine1, setAddressLine1,
    addressLine2, setAddressLine2,
    city, setCity,
    state, setState,
    country, setCountry,
    postalCode, setPostalCode,
    logoUri,
    existingLogoUrl: org?.logo_url || null,
    handleLogoPicked,
    handleRemoveLogo,
    errors,
    isSubmitting,
    submitError,
    handleSubmit,
  };
};
