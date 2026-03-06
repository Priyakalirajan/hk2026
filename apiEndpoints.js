// ── API Endpoints ──────────────────────────────────────────
// Replace with production URLs before go-live
// For hackathon: all point to sandbox/mock endpoints

export const API_BASE = 'https://api.oblswiftonboard.com/v1'; // your backend

export const KYC_ENDPOINTS = {
  PAN:       'https://sandbox.kyc-api.com/pan/verify',
  GST:       'https://api.gst.gov.in/commonapi/search',
  AADHAAR:   'https://sandbox.kyc-api.com/aadhaar/send-otp',
  AADHAAR_VERIFY: 'https://sandbox.kyc-api.com/aadhaar/verify-otp',
  BANK:      'https://sandbox.cashfree.com/bank/verify',   // Penny Drop
  PASSPORT:  'https://sandbox.kyc-api.com/passport/verify',
};

export const ERP_ENDPOINTS = {
  BASE:      'https://api.businesscentral.dynamics.com/v2.0',
  CUSTOMERS: '/companies/{companyId}/customers',
  VENDORS:   '/companies/{companyId}/vendors',
};

// ── Workflow Department Config ──────────────────────────────
export const DEPARTMENTS = [
  { id: 'sales',         label: 'Sales',          icon: '💼', tatHours: 4 },
  { id: 'finance',       label: 'Finance & KYC',  icon: '💰', tatHours: 8 },
  { id: 'legal',         label: 'Legal',           icon: '⚖️', tatHours: 4 },
  { id: 'credit',        label: 'Credit Control',  icon: '📈', tatHours: 4 },
  { id: 'it',            label: 'IT / ERP',        icon: '💻', tatHours: 2 },
];

export const TOTAL_TAT_HOURS = DEPARTMENTS.reduce((s, d) => s + d.tatHours, 0); // 22h

// ── Application Status Labels ───────────────────────────────
export const APP_STATUS = {
  DRAFT:         { label: 'Draft',             color: '#4a5568' },
  SUBMITTED:     { label: 'Submitted',          color: '#3b82f6' },
  KYC_PENDING:   { label: 'KYC Pending',        color: '#f4a034' },
  KYC_VERIFIED:  { label: 'KYC Verified',       color: '#22c55e' },
  UNDER_REVIEW:  { label: 'Under Review',       color: '#8b5cf6' },
  APPROVED:      { label: 'Approved',           color: '#22c55e' },
  REJECTED:      { label: 'Rejected',           color: '#ef4444' },
  ERP_PUSHED:    { label: 'ERP Integrated',     color: '#a855f7' },
  COMPLETED:     { label: 'Active Dealer',      color: '#22c55e' },
};

// ── Business Entity Types ───────────────────────────────────
export const ENTITY_TYPES = [
  'Private Limited Company',
  'Public Limited Company',
  'Partnership Firm',
  'Proprietorship',
  'Limited Liability Partnership (LLP)',
  'One Person Company (OPC)',
];

export const BUSINESS_CATEGORIES = [
  'Dealer / Distributor',
  'Corporate Customer',
  'Builder / Developer',
  'Institutional Buyer',
  'Government / PSU',
];
