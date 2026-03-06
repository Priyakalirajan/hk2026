/**
 * kycService.js
 * Handles all KYC verification API calls:
 *   PAN · GST · Aadhaar (OTP) · Bank Penny Drop · Passport
 *
 * For hackathon demo: mock responses simulate real API behaviour.
 * Swap MOCK_MODE = false + add real API keys to .env for production.
 */

import apiClient from './apiClient';
import { KYC_ENDPOINTS } from '../constants/apiEndpoints';

const MOCK_MODE = true; // ← Set false in production

// ── Simulated network delay ──────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ════════════════════════════════════════════════════════════
//  PAN VERIFICATION
// ════════════════════════════════════════════════════════════
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
  const res = await apiClient.post(KYC_ENDPOINTS.PAN, { pan: panNumber });
  return res.data;
};

// ════════════════════════════════════════════════════════════
//  GST VERIFICATION
// ════════════════════════════════════════════════════════════
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
  const res = await apiClient.get(`${KYC_ENDPOINTS.GST}?gstin=${gstin}`);
  return res.data;
};

// ════════════════════════════════════════════════════════════
//  AADHAAR — Send OTP
// ════════════════════════════════════════════════════════════
export const sendAadhaarOTP = async (aadhaarNumber) => {
  if (MOCK_MODE) {
    await delay(700);
    return {
      success: true,
      transactionId: 'TXN' + Date.now(),
      message: 'OTP sent to Aadhaar-registered mobile number',
    };
  }
  const res = await apiClient.post(KYC_ENDPOINTS.AADHAAR, { aadhaar: aadhaarNumber });
  return res.data;
};

// ════════════════════════════════════════════════════════════
//  AADHAAR — Verify OTP
// ════════════════════════════════════════════════════════════
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
  const res = await apiClient.post(KYC_ENDPOINTS.AADHAAR_VERIFY, { transactionId, otp });
  return res.data;
};

// ════════════════════════════════════════════════════════════
//  BANK ACCOUNT — Penny Drop Verification
// ════════════════════════════════════════════════════════════
export const verifyBankAccount = async ({ accountNumber, ifsc, accountHolder }) => {
  if (MOCK_MODE) {
    await delay(1800); // Simulate penny drop processing time
    const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
    if (!ifscValid) return { success: false, error: 'Invalid IFSC code format.' };
    return {
      success: true,
      data: {
        accountNumber: accountNumber.replace(/.(?=.{4})/g, 'X'), // mask
        ifsc: ifsc.toUpperCase(),
        bankName: 'STATE BANK OF INDIA',
        branchName: 'MG ROAD, GURUGRAM',
        accountHolder: accountHolder.toUpperCase(),
        accountType: 'Current Account',
        pennyDropStatus: 'SUCCESS',
        pennyAmount: '₹1.00',
        verifiedAt: new Date().toISOString(),
      },
    };
  }
  const res = await apiClient.post(KYC_ENDPOINTS.BANK, { accountNumber, ifsc, accountHolder });
  return res.data;
};

// ════════════════════════════════════════════════════════════
//  IFSC LOOKUP
// ════════════════════════════════════════════════════════════
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
