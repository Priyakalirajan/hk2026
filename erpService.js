/**
 * erpService.js
 * Handles Microsoft Business Central 365 integration.
 * Pushes approved dealer/customer data to create records
 * and generates the official Dealer Code.
 */

const MOCK_MODE = true;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Generate a dealer code in OBL format: OBL-DLR-{STATE}-{NUM}
const generateDealerCode = (stateCode, category) => {
  const prefix = category === 'Corporate Customer' ? 'CORP' : 'DLR';
  const num = String(Math.floor(1000 + Math.random() * 8999));
  return `OBL-${prefix}-${stateCode.toUpperCase()}-${num}`;
};

// ════════════════════════════════════════════════════════════
//  PUSH TO ERP
//  Called by IT dept after all approvals are complete
// ════════════════════════════════════════════════════════════
export const pushToERP = async (applicationData) => {
  if (MOCK_MODE) {
    await delay(3000); // Simulate ERP API call
    const stateCode = applicationData.state?.substring(0, 2).toUpperCase() || 'XX';
    const dealerCode = generateDealerCode(stateCode, applicationData.businessCategory);

    return {
      success: true,
      data: {
        dealerCode,
        erpCustomerId: 'BC365-' + Date.now(),
        customerGroup: getCreditTier(applicationData.expectedBusiness),
        creditLimit: assignCreditLimit(applicationData.expectedBusiness),
        paymentTerms: 'Net 30 Days',
        priceGroup: 'DEALER-TIER2',
        pushedAt: new Date().toISOString(),
        welcomeKitDispatched: true,
      },
    };
  }

  // Production: actual BC 365 API call
  // const token = await getBC365Token();
  // const res = await apiClient.post(ERP_ENDPOINTS.CUSTOMERS.replace('{companyId}', BC365_COMPANY_ID), {
  //   displayName: applicationData.legalName,
  //   email: applicationData.email,
  //   phoneNumber: applicationData.mobile,
  //   address: { ... },
  //   taxRegistrationNumber: applicationData.gstin,
  // }, { headers: { Authorization: `Bearer ${token}` } });
};

const getCreditTier = (expectedBusiness) => {
  if (expectedBusiness?.includes('1 Crore')) return 'Tier-1 Dealer';
  if (expectedBusiness?.includes('50')) return 'Tier-2 Dealer';
  return 'Tier-3 Dealer';
};

const assignCreditLimit = (expectedBusiness) => {
  if (expectedBusiness?.includes('1 Crore')) return '₹25,00,000';
  if (expectedBusiness?.includes('50')) return '₹12,00,000';
  return '₹5,00,000';
};

// ════════════════════════════════════════════════════════════
//  DISPATCH WELCOME KIT
//  Sends email + SMS with dealer code and onboarding guide
// ════════════════════════════════════════════════════════════
export const dispatchWelcomeKit = async ({ email, mobile, dealerCode, dealerName }) => {
  if (MOCK_MODE) {
    await delay(500);
    console.log(`[WelcomeKit] Sent to ${email} | SMS to ${mobile} | Code: ${dealerCode}`);
    return { success: true, emailSent: true, smsSent: true };
  }
  // Production: trigger email via SendGrid + SMS via MSG91
};
