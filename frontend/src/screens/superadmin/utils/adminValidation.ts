export interface FormErrors {
  org?: string;
  fullName?: string;
  email?: string;
  password?: string;
}

export const validateAdminForm = (
  orgId: string | undefined,
  isQuotaFull: boolean,
  fullName: string,
  email: string,
  password: string
): FormErrors => {
  const errors: FormErrors = {};

  if (!orgId) {
    errors.org = 'Please search and select an organization.';
  } else if (isQuotaFull) {
    errors.org = 'Quota reached for this organization. Upgrade limits first.';
  }

  if (!fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
};

export const generateSecurePassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pwd = 'Adm@';
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};
