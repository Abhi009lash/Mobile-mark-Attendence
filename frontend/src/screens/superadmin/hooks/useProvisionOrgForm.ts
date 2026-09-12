import { useState } from 'react';
import { organizationsApi, OrganizationCreatePayload, ApiError } from '../../../api/organizations';
import { toast } from '../../../components/common/Toast';
import { validateOrganizationForm } from '../utils/organizationValidation';

export const useProvisionOrgForm = (onSuccess: () => void, onClose: () => void) => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [maxAdmins, setMaxAdmins] = useState('');
  const [maxEmployees, setMaxEmployees] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setWebsite('');
    setLogoUri(null);
    setLogoBase64(null);
    setCode('');
    setEmail('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setStateVal('');
    setPostalCode('');
    setCountry('India');
    setMaxAdmins('');
    setMaxEmployees('');
    setFormError(null);
    setFieldErrors({});
  };

  const setField = (setter: (val: string) => void, fieldName: string) => (val: string) => {
    setter(val);
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleNameChange = (val: string) => {
    setField(setName, 'name')(val);
    if (!code || code === name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()) {
      setCode(val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase());
    }
  };

  const setLogo = (uri: string, base64: string | null) => {
    setLogoUri(uri);
    setLogoBase64(base64);
  };

  const handleSubmit = async () => {
    setFormError(null);
    const errors = validateOrganizationForm({
      name,
      email,
      maxAdmins,
      maxEmployees,
      website,
      code,
      phone,
      postalCode,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please resolve the highlighted validation errors.', 'Validation Failed');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedLogoUrl: string | undefined;
      if (logoBase64 || logoUri) {
        try {
          uploadedLogoUrl = await organizationsApi.uploadLogo({
            base64: logoBase64 || undefined,
            imageUri: logoUri || undefined,
          });
        } catch {
          // Fallback if logo upload fails
        }
      }

      const payload: OrganizationCreatePayload = {
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        website: website.trim() || undefined,
        logo_url: uploadedLogoUrl || undefined,
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address_line1: addressLine1.trim() || undefined,
        address_line2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: stateVal.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        country: country.trim() || 'India',
        max_admins: parseInt(maxAdmins.trim(), 10),
        max_employees: parseInt(maxEmployees.trim(), 10),
      };

      const newOrg = await organizationsApi.create(payload);
      resetForm();
      onClose();
      toast.success(
        `"${newOrg.name}" (${newOrg.code}) has been provisioned successfully.`,
        'Organization Created'
      );
      onSuccess();
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

  return {
    name,
    website,
    logoUri,
    code,
    email,
    phone,
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    city,
    setCity,
    stateVal,
    setStateVal,
    postalCode,
    country,
    setCountry,
    maxAdmins,
    maxEmployees,
    isSubmitting,
    formError,
    fieldErrors,
    resetForm,
    setField,
    setName,
    setWebsite,
    setCode,
    setEmail,
    setPhone,
    setPostalCode,
    setMaxAdmins,
    setMaxEmployees,
    handleNameChange,
    setLogo,
    handleSubmit,
  };
};
