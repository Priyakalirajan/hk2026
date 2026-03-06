/**
 * validators.js
 * Client-side format validators for all KYC fields.
 * First line of defence before API verification is called.
 */

export const validatePAN = (pan) => {
  if (!pan) return 'PAN is required';
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(pan)) return 'Invalid PAN format (e.g. ABCDE1234F)';
  return null;
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return 'GSTIN is required';
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gstin))
    return 'Invalid GSTIN format (15 characters)';
  return null;
};

export const validateAadhaar = (aadhaar) => {
  const clean = aadhaar?.replace(/\s/g, '');
  if (!clean) return 'Aadhaar number is required';
  if (!/^\d{12}$/.test(clean)) return 'Aadhaar must be 12 digits';
  return null;
};

export const validateIFSC = (ifsc) => {
  if (!ifsc) return 'IFSC code is required';
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) return 'Invalid IFSC format (e.g. SBIN0001234)';
  return null;
};

export const validateMobile = (mobile) => {
  const clean = mobile?.replace(/\D/g, '');
  if (!clean) return 'Mobile number is required';
  if (!/^[6-9]\d{9}$/.test(clean)) return 'Enter a valid 10-digit Indian mobile number';
  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
};

export const validateAccountNumber = (acc) => {
  if (!acc) return 'Account number is required';
  if (acc.length < 9 || acc.length > 18) return 'Account number must be 9–18 digits';
  if (!/^\d+$/.test(acc)) return 'Account number must contain only digits';
  return null;
};

export const validatePassport = (passport) => {
  if (!passport) return null; // Optional field
  if (!/^[A-Z][1-9][0-9]{6}$/i.test(passport)) return 'Invalid passport format (e.g. A1234567)';
  return null;
};

// Validate entire step and return all errors as object
export const validateStep = (fields, rules) => {
  const errors = {};
  for (const [key, validator] of Object.entries(rules)) {
    const err = validator(fields[key]);
    if (err) errors[key] = err;
  }
  return errors; // empty object = valid
};
