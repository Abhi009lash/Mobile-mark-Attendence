export interface OrganizationFormValues {
  name: string;
  email: string;
  maxAdmins: string;
  maxEmployees: string;
  website: string;
  code: string;
  phone: string;
  postalCode: string;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const URL_REGEX =
  /^(https?:\/\/)?([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/.*)?$/i;

export const validateOrganizationForm = (
  values: OrganizationFormValues
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const trimmedName = values.name.trim();
  const trimmedEmail = values.email.trim().toLowerCase();
  const trimmedAdmins = values.maxAdmins.trim();
  const trimmedEmployees = values.maxEmployees.trim();
  const trimmedWebsite = values.website.trim();
  const trimmedCode = values.code.trim().toUpperCase();
  const trimmedPhone = values.phone.trim();
  const trimmedPostal = values.postalCode.trim();

  // 1. Organization Name (REQUIRED)
  if (!trimmedName) {
    errors.name = 'Organization name is required.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Organization name must be at least 2 characters.';
  } else if (trimmedName.length > 100) {
    errors.name = 'Organization name cannot exceed 100 characters.';
  }

  // 2. Email (REQUIRED)
  if (!trimmedEmail) {
    errors.email = 'Contact / Admin email is required.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address (e.g. admin@company.com).';
  }

  // 3. Max Admins (REQUIRED)
  if (!trimmedAdmins) {
    errors.maxAdmins = 'Max Admins is required.';
  } else if (!/^\d+$/.test(trimmedAdmins)) {
    errors.maxAdmins = 'Max Admins must be a positive whole number.';
  } else {
    const numAdmins = parseInt(trimmedAdmins, 10);
    if (numAdmins < 1) {
      errors.maxAdmins = 'Max Admins must be at least 1.';
    } else if (numAdmins > 1000) {
      errors.maxAdmins = 'Max Admins cannot exceed 1,000.';
    }
  }

  // 4. Workforce Seats (REQUIRED)
  if (!trimmedEmployees) {
    errors.maxEmployees = 'Workforce Seats is required.';
  } else if (!/^\d+$/.test(trimmedEmployees)) {
    errors.maxEmployees = 'Workforce Seats must be a positive whole number.';
  } else {
    const numEmployees = parseInt(trimmedEmployees, 10);
    if (numEmployees < 1) {
      errors.maxEmployees = 'Workforce Seats must be at least 1.';
    } else if (numEmployees > 100000) {
      errors.maxEmployees = 'Workforce Seats cannot exceed 100,000.';
    }
  }

  // 5. Website URL (OPTIONAL)
  if (trimmedWebsite && !URL_REGEX.test(trimmedWebsite)) {
    errors.website = 'Enter a valid URL (e.g. acme.com or https://acme.com).';
  }

  // 6. Organization Code (OPTIONAL)
  if (trimmedCode) {
    if (trimmedCode.length < 2) {
      errors.code = 'Code must be at least 2 characters.';
    } else if (trimmedCode.length > 20) {
      errors.code = 'Code cannot exceed 20 characters.';
    } else if (!/^[A-Z0-9_-]+$/.test(trimmedCode)) {
      errors.code = 'Code can only contain uppercase letters, numbers, -, and _.';
    }
  }

  // 7. Phone (OPTIONAL)
  if (trimmedPhone) {
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      errors.phone = 'Enter a valid phone number (7 to 15 digits).';
    }
  }

  // 8. Postal Code (OPTIONAL)
  if (trimmedPostal) {
    if (trimmedPostal.length < 3 || trimmedPostal.length > 10) {
      errors.postalCode = 'Enter a valid postal/PIN code (3 to 10 characters).';
    }
  }

  return errors;
};
