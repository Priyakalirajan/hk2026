import axios from 'axios';

// ════════════════════════════════════════════════════════════
// 1. THEME
// ════════════════════════════════════════════════════════════
export const COLORS = {
  bg: '#0a0d14',
  surface: '#111520',
  surface2: '#161b2e',
  surface3: '#1e2540',
  border: '#252d47',
  accent: '#FFCC00', 
  accentDark: '#FED94B',
  green: '#288840', 
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  text: '#e8eaf2',
  textSecondary: '#8892b0',
  textMuted: '#4a5568',
  white: '#ffffff',
  black: '#000000',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xxl: 30, hero: 38,
  },
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32, xxxl: 48,
};

export const RADIUS = {
  sm: 6, md: 10, lg: 14, xl: 20, full: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  accent: {
    shadowColor: '#f4a034',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
};

// ════════════════════════════════════════════════════════════
// 2. ENDPOINTS & CONSTANTS
// ════════════════════════════════════════════════════════════
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'; 

export const KYC_ENDPOINTS = {
  PAN:            `${API_BASE}/kyc/pan`,
  GST:            `${API_BASE}/kyc/gstin`,
  AADHAAR:        `${API_BASE}/kyc/aadhaar/send-otp`,
  AADHAAR_VERIFY: `${API_BASE}/kyc/aadhaar/verify-otp`,
  BANK:           `${API_BASE}/kyc/penny-drop`,
  PASSPORT:       `${API_BASE}/kyc/passport`,
};

export const ERP_ENDPOINTS = { 
  BASE:      'https://api.businesscentral.dynamics.com/v2.0',
  CUSTOMERS: '/companies/{companyId}/customers',
  VENDORS:   '/companies/{companyId}/vendors',
};

export const DEPARTMENTS = [
  { id: 'sales',         label: 'Sales',          icon: 'briefcase', tatHours: 4 },
  { id: 'finance',       label: 'Finance & KYC',  icon: 'wallet', tatHours: 8 },
  { id: 'legal',         label: 'Legal',           icon: 'scale', tatHours: 4 },
  { id: 'credit',        label: 'Credit Control',  icon: 'stats-chart', tatHours: 4 },
  { id: 'it',            label: 'IT / ERP',        icon: 'laptop', tatHours: 2 },
];

export const TOTAL_TAT_HOURS = DEPARTMENTS.reduce((s, d) => s + d.tatHours, 0);

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

// ════════════════════════════════════════════════════════════
// 3. API CLIENT
// ════════════════════════════════════════════════════════════
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ════════════════════════════════════════════════════════════
// 4. KYC SERVICES
// ════════════════════════════════════════════════════════════
const MOCK_MODE = true; 
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const verifyPAN = async (panNumber) => {
  if (MOCK_MODE) {
    await delay(900);
    const isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase());
    if (!isValid) return { success: false, error: 'Invalid PAN format. Expected: ABCDE1234F' };
    return {
      success: true,
      data: {
        pan: panNumber.toUpperCase(),
        name: 'SHARMA TILES & INTERIORS PVT LTD',
        status: 'VALID',
        type: 'Company',
        verifiedAt: new Date().toISOString(),
      },
    };
  }
  const res = await apiClient.post(KYC_ENDPOINTS.PAN, { panNumber });
  return res.data;
};

export const verifyGST = async (gstin) => {
  if (MOCK_MODE) {
    await delay(1100);
    const isValid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
    if (!isValid) return { success: false, error: 'Invalid GSTIN format.' };
    return {
      success: true,
      data: {
        gstin: gstin.toUpperCase(),
        legalName: 'SHARMA TILES & INTERIORS PVT LTD',
        tradeName: 'SHARMA TILES',
        status: 'Active',
        registrationDate: '20/08/2017',
        stateCode: gstin.substring(0, 2),
        turnoverSlab: '₹40L - 1.5Cr',
        filingFrequency: 'Monthly',
        verifiedAt: new Date().toISOString(),
      },
    };
  }
  const res = await apiClient.post(KYC_ENDPOINTS.GST, { gstin });
  return res.data;
};

export const sendAadhaarOTP = async (aadhaarNumber) => {
  if (MOCK_MODE) {
    await delay(700);
    return {
      success: true,
      transactionId: 'TXN' + Date.now(),
      message: 'OTP sent to Aadhaar-registered mobile number',
    };
  }
  const res = await apiClient.post(KYC_ENDPOINTS.AADHAAR, { aadhaarNumber });
  return res.data;
};

export const verifyAadhaarOTP = async (transactionId, otp) => {
  if (MOCK_MODE) {
    await delay(800);
    if (otp === '999999') return { success: false, error: 'Invalid OTP. Please try again.' };
    return {
      success: true,
      data: {
        maskedAadhaar: 'XXXX XXXX 5432',
        name: 'RAJESH SHARMA',
        dob: '15/06/1978',
        gender: 'Male',
        address: 'Gurugram, Haryana',
        verifiedAt: new Date().toISOString(),
      },
    };
  }
  const res = await apiClient.post(KYC_ENDPOINTS.AADHAAR_VERIFY, { txnId: transactionId, otp });
  return res.data;
};

export const verifyBankAccount = async ({ accountNumber, ifsc, accountHolderName }) => {
  if (MOCK_MODE) {
    await delay(1800);
    const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
    if (!ifscValid) return { success: false, error: 'Invalid IFSC code format.' };
    return {
      success: true,
      data: {
        accountNumber: accountNumber.replace(/.(?=.{4})/g, 'X'),
        ifsc: ifsc.toUpperCase(),
        bankName: 'STATE BANK OF INDIA',
        branchName: 'MG ROAD, GURUGRAM',
        accountHolder: accountHolderName?.toUpperCase() || 'SHARMA TILES',
        accountType: 'Current Account',
        pennyDropStatus: 'SUCCESS',
        pennyAmount: '₹1.00',
        verifiedAt: new Date().toISOString(),
      },
    };
  }
  const res = await apiClient.post(KYC_ENDPOINTS.BANK, { accountNumber, ifsc, accountHolderName });
  return res.data;
};

export const lookupIFSC = async (ifsc) => {
  if (MOCK_MODE) {
    await delay(500);
    return {
      success: true,
      data: { bankName: 'State Bank of India', branchName: 'MG Road, Gurugram', city: 'Gurugram', state: 'Haryana' },
    };
  }
  const res = await apiClient.get(`https://ifsc.razorpay.com/${ifsc}`);
  return { success: true, data: res.data };
};

// ════════════════════════════════════════════════════════════
// 5. ERP SERVICES
// ════════════════════════════════════════════════════════════
export const pushToERP = async (applicationData) => {
  try {
    const res = await apiClient.post(`/erp/${applicationData.application_id || applicationData.id}/push`, {
      businessCategory: applicationData.businessCategory || 'Dealer / Distributor',
      expectedBusiness: applicationData.expectedBusiness || '10 Lakhs'
    });
    return res.data;
  } catch (error) {
    console.error("ERP Push Error", error);
    return { success: false, error: 'Failed to push to ERP' };
  }
};

export const dispatchWelcomeKit = async ({ email, mobile, dealerCode, dealerName }) => {
  console.log(`[WelcomeKit] Sent to ${email} | SMS to ${mobile} | Code: ${dealerCode}`);
  return { success: true, emailSent: true, smsSent: true };
};

export default apiClient;
