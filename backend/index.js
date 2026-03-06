/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         OBL SwiftOnboard — Full Backend API Server           ║
 * ║         Express.js · Node 20 LTS · Mock + Sandbox Mode       ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ENV FLAGS (set in .env):
 *   MOCK_MODE=true         → All KYC APIs return realistic mock data
 *   JWT_SECRET=your_secret → Auth token signing key
 *   PORT=3000              → Local dev port
 *
 * ENDPOINTS COVERED:
 *   /api/auth              → Register, Login, Refresh Token
 *   /api/kyc/*             → PAN, GSTIN, Aadhaar OTP, Penny Drop, IFSC, Passport
 *   /api/applications/*    → Create, Get, List, Step-save, Submit, Track
 *   /api/workflow/*        → Approve, Reject, RFI, Escalate per department
 *   /api/erp/*             → BC 365 mock push, dealer code generation
 *   /api/notifications/*   → SMS, Email, Push trigger log
 *   /api/admin/*           → KPI dashboard, TAT monitor, user management
 */

const express  = require('express');
const cors     = require('cors');
const crypto   = require('crypto');

const app = express();

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─────────────────────────────────────────────
// CONFIG & IN-MEMORY STORE
// ─────────────────────────────────────────────
const MOCK_MODE  = process.env.MOCK_MODE !== 'false'; // default ON
const JWT_SECRET = process.env.JWT_SECRET || 'obl_swiftonboard_dev_secret_2025';

// In-memory stores (replace with PostgreSQL in production)
const store = {
  users:        {},  // { [userId]: User }
  applications: {},  // { [appId]: Application }
  kycLogs:      [],  // KYC audit trail
  workflowLogs: [],  // Approval action log
  notifications:[],  // Notification dispatch log
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Simulate realistic async API latency */
const delay = (ms) => new Promise(r => setTimeout(r, ms));

/** Generate a unique ID */
const uid = (prefix = '') =>
  prefix + crypto.randomBytes(8).toString('hex').toUpperCase();

/** Simple JWT-like token (base64 payload, no lib dependency) */
const signToken = (payload) => {
  const data    = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig     = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
};

const verifyToken = (token) => {
  if (!token) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  if (sig !== expected) return null;
  try { return JSON.parse(Buffer.from(data, 'base64url').toString()); }
  catch { return null; }
};

/** Auth middleware — attach user to req */
const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token  = header.replace('Bearer ', '').trim();
  const user   = verifyToken(token);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized — invalid or missing token' });
  req.user = user;
  next();
};

/** Generate auto dealer code: OBL-{TYPE}-{STATE}-{SEQ} */
const generateDealerCode = (type = 'DLR', gstin = '') => {
  const stateCode = gstin.slice(0, 2) || 'XX';
  const seq       = String(Math.floor(1000 + Math.random() * 8999));
  return `OBL-${type.toUpperCase()}-${stateCode}-${seq}`;
};

/** Compute TAT status for a workflow stage */
const tatStatus = (startedAt, tatHours) => {
  if (!startedAt) return 'PENDING';
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 36e5; // hours
  const pct     = (elapsed / tatHours) * 100;
  if (pct >= 200) return 'CRITICAL';
  if (pct >= 150) return 'SEVERE';
  if (pct >= 100) return 'BREACHED';
  if (pct >= 80)  return 'WARNING';
  return 'ON_TIME';
};

// Department definitions with TAT
const DEPARTMENTS = [
  { id: 'kyc_auto',  name: 'Auto KYC',         tatHours: 0,  level: 0 },
  { id: 'sales',     name: 'Sales',             tatHours: 4,  level: 1 },
  { id: 'finance',   name: 'Finance & KYC',     tatHours: 8,  level: 2 },
  { id: 'legal',     name: 'Legal',             tatHours: 4,  level: 3 },
  { id: 'credit',    name: 'Credit Control',    tatHours: 4,  level: 4 },
  { id: 'it',        name: 'IT / ERP',          tatHours: 2,  level: 5 },
];

// Application stage machine
const STAGES = [
  'DRAFT', 'SUBMITTED', 'KYC_IN_PROGRESS', 'KYC_COMPLETE',
  'SALES_REVIEW', 'FINANCE_REVIEW', 'LEGAL_REVIEW',
  'CREDIT_REVIEW', 'IT_ERP', 'APPROVED', 'REJECTED',
];

// ─────────────────────────────────────────────
// ROUTE: API ROOT
// ─────────────────────────────────────────────
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    service: 'OBL SwiftOnboard API',
    version: '1.0.0',
    mockMode: MOCK_MODE,
    endpoints: {
      auth:          ['POST /api/auth/register', 'POST /api/auth/login'],
      kyc:           ['POST /api/kyc/pan', 'POST /api/kyc/gstin', 'POST /api/kyc/aadhaar/send-otp',
                      'POST /api/kyc/aadhaar/verify-otp', 'POST /api/kyc/penny-drop',
                      'GET  /api/kyc/ifsc/:code', 'POST /api/kyc/passport'],
      applications:  ['POST /api/applications', 'GET /api/applications/:id',
                      'PATCH /api/applications/:id/step', 'POST /api/applications/:id/submit',
                      'GET  /api/applications/:id/track'],
      workflow:      ['POST /api/workflow/:id/approve', 'POST /api/workflow/:id/reject',
                      'POST /api/workflow/:id/rfi'],
      erp:           ['POST /api/erp/:id/push'],
      notifications: ['GET  /api/notifications/log'],
      admin:         ['GET  /api/admin/kpi', 'GET  /api/admin/applications'],
    },
  });
});


// ════════════════════════════════════════════════════
// ██  AUTH ROUTES
// ════════════════════════════════════════════════════

/**
 * POST /api/auth/register
 * Body: { name, email, password, role }
 * Roles: dealer | sales | finance | legal | credit | it | admin
 */
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'dealer', mobile } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, error: 'name, email and password are required' });

  const existing = Object.values(store.users).find(u => u.email === email);
  if (existing)
    return res.status(409).json({ success: false, error: 'Email already registered' });

  const userId    = uid('USR-');
  const hash      = crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
  const user      = { userId, name, email, mobile: mobile || '', role, passwordHash: hash, createdAt: new Date() };
  store.users[userId] = user;

  const token = signToken({ userId, email, role, name });
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data:    { userId, name, email, role, token },
  });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, error: 'email and password required' });

  const user = Object.values(store.users).find(u => u.email === email);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const hash = crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
  if (hash !== user.passwordHash)
    return res.status(401).json({ success: false, error: 'Invalid password' });

  const token = signToken({ userId: user.userId, email: user.email, role: user.role, name: user.name });
  res.json({
    success: true,
    data: { userId: user.userId, name: user.name, email: user.email, role: user.role, token },
  });
});

/**
 * GET /api/auth/me
 * Returns current user info from token
 */
app.get('/api/auth/me', auth, (req, res) => {
  const user = store.users[req.user.userId];
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  const { passwordHash, ...safe } = user;
  res.json({ success: true, data: safe });
});


// ════════════════════════════════════════════════════
// ██  KYC ROUTES
// ════════════════════════════════════════════════════

/**
 * POST /api/kyc/pan
 * Body: { panNumber, applicationId? }
 * Validates PAN format, returns entity name & status (mock).
 */
app.post('/api/kyc/pan', auth, async (req, res) => {
  const { panNumber, applicationId } = req.body;
  if (!panNumber) return res.status(400).json({ success: false, error: 'panNumber is required' });

  // Strict PAN regex: AAAAA9999A
  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  if (!PAN_REGEX.test(panNumber.toUpperCase()))
    return res.status(422).json({ success: false, error: 'Invalid PAN format. Expected: AAAAA9999A' });

  await delay(MOCK_MODE ? 800 : 0); // simulate latency

  // Entity type from 4th char of PAN
  const entityMap = { P: 'Individual', C: 'Company', H: 'HUF', F: 'Firm', A: 'AOP', B: 'BOI', G: 'Government', J: 'AJP' };
  const entityChar = panNumber.toUpperCase()[3];

  const result = {
    panNumber:   panNumber.toUpperCase(),
    legalName:   MOCK_MODE ? 'MOCK ENTERPRISES PRIVATE LIMITED' : null,
    entityType:  entityMap[entityChar] || 'Other',
    status:      'Active',
    linkedGST:   MOCK_MODE ? ['29MOCK0000A1Z5'] : [],
    verifiedAt:  new Date(),
    mockMode:    MOCK_MODE,
  };

  // Log KYC
  store.kycLogs.push({ type: 'PAN', panNumber: panNumber.toUpperCase(), applicationId, result: 'PASS', ts: new Date() });

  res.json({ success: true, data: result });
});

/**
 * POST /api/kyc/gstin
 * Body: { gstin, applicationId? }
 * Returns legal name, filing status, turnover slab, state code.
 */
app.post('/api/kyc/gstin', auth, async (req, res) => {
  const { gstin, applicationId } = req.body;
  if (!gstin) return res.status(400).json({ success: false, error: 'gstin is required' });

  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!GSTIN_REGEX.test(gstin.toUpperCase()))
    return res.status(422).json({ success: false, error: 'Invalid GSTIN format' });

  await delay(MOCK_MODE ? 1200 : 0);

  const stateCodeMap = {
    '01':'Jammu & Kashmir','02':'Himachal Pradesh','03':'Punjab','04':'Chandigarh',
    '05':'Uttarakhand','06':'Haryana','07':'Delhi','08':'Rajasthan','09':'Uttar Pradesh',
    '10':'Bihar','11':'Sikkim','12':'Arunachal Pradesh','13':'Nagaland','14':'Manipur',
    '15':'Mizoram','16':'Tripura','17':'Meghalaya','18':'Assam','19':'West Bengal',
    '20':'Jharkhand','21':'Odisha','22':'Chhattisgarh','23':'Madhya Pradesh',
    '24':'Gujarat','27':'Maharashtra','28':'Andhra Pradesh','29':'Karnataka',
    '32':'Kerala','33':'Tamil Nadu','36':'Telangana','37':'Andhra Pradesh (new)',
  };

  const stateCode = gstin.slice(0, 2);
  const result = {
    gstin:          gstin.toUpperCase(),
    legalName:      MOCK_MODE ? 'MOCK TRADERS & DISTRIBUTORS LLP' : null,
    tradeName:      MOCK_MODE ? 'Mock Traders' : null,
    registrationType: 'Regular',
    filingStatus:   'Active',
    turnoverSlab:   '5-10 Cr',
    stateCode,
    stateName:      stateCodeMap[stateCode] || 'Unknown',
    registrationDate: '01/04/2019',
    lastFiledReturn:  MOCK_MODE ? '2025-01-31' : null,
    verifiedAt:     new Date(),
    mockMode:       MOCK_MODE,
  };

  store.kycLogs.push({ type: 'GSTIN', gstin: gstin.toUpperCase(), applicationId, result: 'PASS', ts: new Date() });

  res.json({ success: true, data: result });
});

/**
 * POST /api/kyc/aadhaar/send-otp
 * Body: { aadhaarNumber, applicationId? }
 * Sends OTP to Aadhaar-linked mobile (UIDAI compliant — never stored).
 */
app.post('/api/kyc/aadhaar/send-otp', auth, async (req, res) => {
  const { aadhaarNumber, applicationId } = req.body;
  if (!aadhaarNumber) return res.status(400).json({ success: false, error: 'aadhaarNumber is required' });

  const clean = aadhaarNumber.replace(/\s/g, '');
  if (!/^\d{12}$/.test(clean))
    return res.status(422).json({ success: false, error: 'Aadhaar must be a 12-digit number' });

  await delay(MOCK_MODE ? 800 : 0);

  // Generate a mock transaction ID (in production: from UIDAI / AUA)
  const txnId = uid('AADHAAR-TXN-');
  const masked = 'XXXX XXXX ' + clean.slice(8);

  // Temporarily store txnId → aadhaar mapping for OTP verification
  store.kycLogs.push({
    type: 'AADHAAR_OTP_SEND', txnId, maskedAadhaar: masked,
    applicationId, ts: new Date(), ttlMin: 10,
  });

  res.json({
    success: true,
    message: MOCK_MODE
      ? 'Mock OTP sent. Use code 123456 to verify.'
      : 'OTP sent to Aadhaar-linked mobile number.',
    data: { txnId, maskedAadhaar: masked, otpExpiresInMin: 10, mockMode: MOCK_MODE },
  });
});

/**
 * POST /api/kyc/aadhaar/verify-otp
 * Body: { txnId, otp, applicationId? }
 * Verifies OTP, returns masked name & address only (DPDP compliant).
 */
app.post('/api/kyc/aadhaar/verify-otp', auth, async (req, res) => {
  const { txnId, otp, applicationId } = req.body;
  if (!txnId || !otp) return res.status(400).json({ success: false, error: 'txnId and otp are required' });

  await delay(MOCK_MODE ? 1000 : 0);

  const log = store.kycLogs.find(l => l.type === 'AADHAAR_OTP_SEND' && l.txnId === txnId);
  if (!log) return res.status(404).json({ success: false, error: 'Transaction not found or expired' });

  const isValid = MOCK_MODE ? otp === '123456' : false; // real: UIDAI verify call
  if (!isValid) return res.status(422).json({ success: false, error: 'Invalid OTP. Please try again.' });

  const result = {
    verified:    true,
    txnId,
    maskedName:  'M**K E***RPRISES',
    maskedDOB:   'XX/XX/19XX',
    gender:      'M',
    address: {
      state:    'Karnataka',
      district: 'Bengaluru Urban',
      pincode:  '560001',
    },
    verifiedAt:  new Date(),
    mockMode:    MOCK_MODE,
  };

  store.kycLogs.push({ type: 'AADHAAR_OTP_VERIFY', txnId, applicationId, result: 'PASS', ts: new Date() });

  res.json({ success: true, data: result });
});

/**
 * POST /api/kyc/penny-drop
 * Body: { accountNumber, ifsc, accountHolderName, applicationId? }
 * Drops Re.1 to verify bank account (Cashfree/Razorpay mock).
 */
app.post('/api/kyc/penny-drop', auth, async (req, res) => {
  const { accountNumber, ifsc, accountHolderName, applicationId } = req.body;
  if (!accountNumber || !ifsc || !accountHolderName)
    return res.status(400).json({ success: false, error: 'accountNumber, ifsc and accountHolderName are required' });

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase()))
    return res.status(422).json({ success: false, error: 'Invalid IFSC format. Expected: AAAA0XXXXXX' });

  await delay(MOCK_MODE ? 2000 : 0);

  const result = {
    verified:           true,
    accountNumber:      '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4),
    ifsc:               ifsc.toUpperCase(),
    bankName:           MOCK_MODE ? 'HDFC Bank' : null,
    branch:             MOCK_MODE ? 'Bengaluru Main' : null,
    nameMatch:          'FULL',   // FULL | PARTIAL | MISMATCH
    nameMatchScore:     98,       // %
    registeredName:     MOCK_MODE ? accountHolderName : null,
    transactionRef:     uid('PENNY-'),
    amountDropped:      1.00,
    verifiedAt:         new Date(),
    mockMode:           MOCK_MODE,
  };

  store.kycLogs.push({ type: 'PENNY_DROP', accountNumber: result.accountNumber, applicationId, result: 'PASS', ts: new Date() });

  res.json({ success: true, data: result });
});

/**
 * GET /api/kyc/ifsc/:code
 * No auth — lightweight lookup. Auto-fills bank/branch/city/state.
 */
app.get('/api/kyc/ifsc/:code', async (req, res) => {
  const { code } = req.params;
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code.toUpperCase()))
    return res.status(422).json({ success: false, error: 'Invalid IFSC format' });

  await delay(MOCK_MODE ? 500 : 0);

  // Mock IFSC data — in production: call Razorpay IFSC API or maintain local DB
  const MOCK_IFSC_DB = {
    'HDFC0001234': { bank: 'HDFC Bank',        branch: 'Bengaluru Main',      city: 'Bengaluru',  state: 'Karnataka',   micr: '560240001' },
    'ICIC0002345': { bank: 'ICICI Bank',        branch: 'Connaught Place',     city: 'New Delhi',  state: 'Delhi',       micr: '110229002' },
    'SBIN0003456': { bank: 'State Bank of India', branch: 'Andheri West',     city: 'Mumbai',     state: 'Maharashtra', micr: '400002001' },
    'AXIS0004567': { bank: 'Axis Bank',         branch: 'T Nagar',            city: 'Chennai',    state: 'Tamil Nadu',  micr: '600211001' },
    'PUNB0005678': { bank: 'Punjab National Bank', branch: 'Sector 17',       city: 'Chandigarh', state: 'Punjab',      micr: '160024001' },
  };

  const data = MOCK_IFSC_DB[code.toUpperCase()] || {
    bank: 'MOCK BANK', branch: 'MOCK BRANCH', city: 'MOCK CITY', state: 'MOCK STATE', micr: '000000000',
  };

  res.json({ success: true, data: { ifsc: code.toUpperCase(), ...data, mockMode: MOCK_MODE } });
});

/**
 * POST /api/kyc/passport
 * Body: { passportNumber, dob, name, applicationId? }
 * Optional — used for corporate director verification.
 */
app.post('/api/kyc/passport', auth, async (req, res) => {
  const { passportNumber, dob, name, applicationId } = req.body;
  if (!passportNumber || !dob)
    return res.status(400).json({ success: false, error: 'passportNumber and dob are required' });

  if (!/^[A-Z][0-9]{7}$/.test(passportNumber.toUpperCase()))
    return res.status(422).json({ success: false, error: 'Invalid passport number format. Expected: A1234567' });

  await delay(MOCK_MODE ? 1500 : 0);

  const result = {
    passportNumber: passportNumber.toUpperCase(),
    name:           name || MOCK_MODE ? 'MOCK DIRECTOR NAME' : null,
    dob,
    nationality:    'INDIAN',
    gender:         'M',
    issueDate:      '2018-06-15',
    expiryDate:     '2028-06-14',
    issuingAuthority: 'Bengaluru',
    status:         'VALID',
    verifiedAt:     new Date(),
    mockMode:       MOCK_MODE,
  };

  store.kycLogs.push({ type: 'PASSPORT', passportNumber: passportNumber.toUpperCase(), applicationId, result: 'PASS', ts: new Date() });

  res.json({ success: true, data: result });
});


// ════════════════════════════════════════════════════
// ██  APPLICATION ROUTES
// ════════════════════════════════════════════════════

/**
 * POST /api/applications
 * Creates a new draft application for the authenticated dealer.
 */
app.post('/api/applications', auth, (req, res) => {
  const appId = uid('APP-');
  const app_  = {
    applicationId:   appId,
    dealerId:        req.user.userId,
    dealerName:      req.user.name,
    stage:           'DRAFT',
    currentDept:     null,
    steps: {
      step1_business:  null,  // Business & Entity Info
      step2_kyc:       null,  // KYC Details
      step3_bank:      null,  // Bank & Financial Info
      step4_docs:      null,  // Documents Upload
      step5_terms:     null,  // Terms & Declaration
    },
    kycResults:      {},
    workflowHistory: [],
    lastSavedAt:     new Date(),
    submittedAt:     null,
    createdAt:       new Date(),
    updatedAt:       new Date(),
  };

  store.applications[appId] = app_;
  res.status(201).json({ success: true, data: { applicationId: appId, stage: 'DRAFT' } });
});

/**
 * GET /api/applications/:id
 * Get full application details (dealer sees their own, admins see all).
 */
app.get('/api/applications/:id', auth, (req, res) => {
  const appl = store.applications[req.params.id];
  if (!appl) return res.status(404).json({ success: false, error: 'Application not found' });

  const isOwner = appl.dealerId === req.user.userId;
  const isStaff = ['sales','finance','legal','credit','it','admin'].includes(req.user.role);
  if (!isOwner && !isStaff)
    return res.status(403).json({ success: false, error: 'Access denied' });

  res.json({ success: true, data: appl });
});

/**
 * PATCH /api/applications/:id/step
 * Auto-save a single step of the multi-step form.
 * Body: { step: 1|2|3|4|5, data: { ...stepFields } }
 *
 * STEP SCHEMA:
 *   Step 1 — Business & Entity Info
 *     { entityType, legalName, tradeName, gstin, pan, incorporationDate,
 *       registeredAddress, operatingAddress, yearsInBusiness, annualTurnover }
 *
 *   Step 2 — KYC Verification
 *     { panVerified, gstinVerified, aadhaarVerified, passportNumber?,
 *       kycTransactionIds: { pan, gstin, aadhaar, passport? } }
 *
 *   Step 3 — Bank & Financial Info
 *     { accountNumber, ifsc, accountHolderName, bankName, branch,
 *       pennyDropVerified, creditLimitRequested, paymentTermsPref }
 *
 *   Step 4 — Documents Upload
 *     { panCard: { url, size, mimeType }, gstCertificate: {...},
 *       aadhaarCard: {...}, bankStatement: {...}, addressProof: {...},
 *       partnershipDeed?: {...}, moa?: {...} }
 *
 *   Step 5 — Terms & Declaration
 *     { agreeToTerms, agreeToPrivacy, declarationName, declarationDate,
 *       signatureBase64? }
 */
app.patch('/api/applications/:id/step', auth, (req, res) => {
  const { step, data } = req.body;
  const appl = store.applications[req.params.id];

  if (!appl) return res.status(404).json({ success: false, error: 'Application not found' });
  if (appl.dealerId !== req.user.userId)
    return res.status(403).json({ success: false, error: 'Cannot edit another dealer\'s application' });
  if (!['DRAFT', 'REJECTED'].includes(appl.stage))
    return res.status(409).json({ success: false, error: `Cannot edit application in stage: ${appl.stage}` });
  if (![1,2,3,4,5].includes(Number(step)))
    return res.status(400).json({ success: false, error: 'step must be 1–5' });
  if (!data || typeof data !== 'object')
    return res.status(400).json({ success: false, error: 'data object is required' });

  const stepKey = ['step1_business','step2_kyc','step3_bank','step4_docs','step5_terms'][step - 1];

  // Merge (partial save support)
  appl.steps[stepKey] = { ...(appl.steps[stepKey] || {}), ...data, savedAt: new Date() };
  appl.lastSavedAt    = new Date();
  appl.updatedAt      = new Date();

  // Compute completion %
  const filled = Object.values(appl.steps).filter(v => v !== null).length;
  const completion = Math.round((filled / 5) * 100);

  res.json({
    success: true,
    message: `Step ${step} auto-saved`,
    data:    { applicationId: appl.applicationId, step, completion, lastSavedAt: appl.lastSavedAt },
  });
});

/**
 * POST /api/applications/:id/submit
 * Final submission — moves stage to SUBMITTED → triggers KYC → routes to Sales.
 * All 5 steps must be completed.
 */
app.post('/api/applications/:id/submit', auth, async (req, res) => {
  const appl = store.applications[req.params.id];

  if (!appl) return res.status(404).json({ success: false, error: 'Application not found' });
  if (appl.dealerId !== req.user.userId)
    return res.status(403).json({ success: false, error: 'Access denied' });
  if (!['DRAFT', 'REJECTED'].includes(appl.stage))
    return res.status(409).json({ success: false, error: `Already submitted (stage: ${appl.stage})` });

  // Validate all steps completed
  const missing = Object.entries(appl.steps)
    .filter(([, v]) => v === null)
    .map(([k]) => k);
  if (missing.length > 0)
    return res.status(422).json({ success: false, error: `Incomplete steps: ${missing.join(', ')}` });

  // Step 5: must agree to terms
  if (!appl.steps.step5_terms?.agreeToTerms)
    return res.status(422).json({ success: false, error: 'Terms & Declaration must be agreed to before submitting' });

  // Transition
  appl.stage       = 'SUBMITTED';
  appl.submittedAt = new Date();
  appl.updatedAt   = new Date();
  appl.workflowHistory.push({ stage: 'SUBMITTED', by: req.user.userId, at: new Date(), note: 'Dealer submitted application' });

  // Auto-trigger KYC (simulate async)
  setTimeout(() => {
    const app_ = store.applications[req.params.id];
    if (!app_) return;
    app_.stage       = 'KYC_COMPLETE';
    app_.currentDept = 'sales';
    app_.deptStartedAt = { sales: new Date() };
    app_.workflowHistory.push({ stage: 'KYC_COMPLETE', by: 'SYSTEM', at: new Date(), note: 'Auto-KYC passed. Routed to Sales.' });

    // Notification log
    store.notifications.push({
      to: app_.dealerId, type: 'SMS+PUSH', event: 'APPLICATION_SUBMITTED',
      message: `Your OBL dealer application ${req.params.id} has been submitted and is under KYC verification.`,
      ts: new Date(),
    });
  }, MOCK_MODE ? 3000 : 0);

  res.json({
    success: true,
    message: 'Application submitted. KYC verification started.',
    data:    { applicationId: appl.applicationId, stage: 'SUBMITTED', submittedAt: appl.submittedAt },
  });
});

/**
 * GET /api/applications/:id/track
 * 8-stage real-time tracker — for the dealer's mobile app.
 */
app.get('/api/applications/:id/track', auth, (req, res) => {
  const appl = store.applications[req.params.id];
  if (!appl) return res.status(404).json({ success: false, error: 'Application not found' });

  const stageOrder = ['DRAFT','SUBMITTED','KYC_IN_PROGRESS','KYC_COMPLETE','SALES_REVIEW','FINANCE_REVIEW','LEGAL_REVIEW','CREDIT_REVIEW','IT_ERP','APPROVED'];
  const currentIdx = stageOrder.indexOf(appl.stage);

  const timeline = stageOrder.map((s, i) => ({
    stage:       s,
    label:       s.replace(/_/g, ' '),
    status:      i < currentIdx ? 'COMPLETED' : i === currentIdx ? 'IN_PROGRESS' : 'PENDING',
    completedAt: appl.workflowHistory.find(h => h.stage === s)?.at || null,
  }));

  const completion = Math.round((Math.max(currentIdx, 0) / (stageOrder.length - 1)) * 100);

  res.json({
    success: true,
    data: {
      applicationId: appl.applicationId,
      currentStage:  appl.stage,
      completion,
      estimatedTATHours: 48,
      submittedAt:   appl.submittedAt,
      timeline,
      lastUpdate:    appl.updatedAt,
      dealerCode:    appl.dealerCode || null,
    },
  });
});

/**
 * GET /api/applications
 * List applications — dealers see their own, staff see their queue.
 * Query: ?status=&page=&limit=
 */
app.get('/api/applications', auth, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  let list = Object.values(store.applications);

  if (req.user.role === 'dealer') {
    list = list.filter(a => a.dealerId === req.user.userId);
  } else if (req.user.role !== 'admin') {
    // Staff only see apps in their department queue
    const deptMap = { sales:'SALES_REVIEW', finance:'FINANCE_REVIEW', legal:'LEGAL_REVIEW', credit:'CREDIT_REVIEW', it:'IT_ERP' };
    const myStage = deptMap[req.user.role];
    if (myStage) list = list.filter(a => a.stage === myStage);
  }

  if (status) list = list.filter(a => a.stage === status.toUpperCase());

  const total = list.length;
  const paged = list.slice((page - 1) * limit, page * limit);

  res.json({ success: true, data: { total, page: Number(page), limit: Number(limit), applications: paged } });
});


// ════════════════════════════════════════════════════
// ██  WORKFLOW / APPROVAL ROUTES
// ════════════════════════════════════════════════════

/** Map dept role → required application stage */
const DEPT_STAGE_MAP = {
  sales:   'SALES_REVIEW',
  finance: 'FINANCE_REVIEW',
  legal:   'LEGAL_REVIEW',
  credit:  'CREDIT_REVIEW',
  it:      'IT_ERP',
  admin:   null, // admin can act on any
};

/** Get next stage after current */
const nextStage = (current) => {
  const order = ['SALES_REVIEW','FINANCE_REVIEW','LEGAL_REVIEW','CREDIT_REVIEW','IT_ERP','APPROVED'];
  const idx = order.indexOf(current);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : 'APPROVED';
};

/**
 * POST /api/workflow/:id/approve
 * Approve application at current stage and advance to next dept.
 * Body: { note?, creditLimit? (credit stage) }
 */
app.post('/api/workflow/:id/approve', auth, (req, res) => {
  const appl  = store.applications[req.params.id];
  const { note, creditLimit } = req.body;

  if (!appl) return res.status(404).json({ success: false, error: 'Application not found' });

  const allowedRoles = ['sales','finance','legal','credit','it','admin'];
  if (!allowedRoles.includes(req.user.role))
    return res.status(403).json({ success: false, error: 'Only staff roles can approve' });

  const expectedStage = DEPT_STAGE_MAP[req.user.role];
  if (expectedStage && appl.stage !== expectedStage)
    return res.status(409).json({ success: false, error: `Application is at ${appl.stage}, not ${expectedStage}` });

  if (appl.stage === 'APPROVED' || appl.stage === 'REJECTED')
    return res.status(409).json({ success: false, error: `Application already ${appl.stage}` });

  // Credit stage — attach credit limit
  if (req.user.role === 'credit' && creditLimit) appl.creditLimit = creditLimit;

  const prevStage   = appl.stage;
  appl.stage        = nextStage(prevStage);
  appl.updatedAt    = new Date();
  if (!appl.deptStartedAt) appl.deptStartedAt = {};
  if (appl.stage !== 'APPROVED') appl.deptStartedAt[appl.stage.toLowerCase().replace('_review','')] = new Date();

  appl.workflowHistory.push({
    stage:    prevStage,
    action:   'APPROVED',
    by:       req.user.userId,
    byName:   req.user.name,
    dept:     req.user.role,
    at:       new Date(),
    note:     note || null,
    nextStage: appl.stage,
  });

  // Notify dealer
  store.notifications.push({
    to: appl.dealerId, type: 'SMS+PUSH+EMAIL', event: 'STAGE_ADVANCE',
    message: `Your application ${req.params.id} has been approved by ${req.user.role.toUpperCase()} and is now at: ${appl.stage}.`,
    ts: new Date(),
  });

  res.json({
    success: true,
    message: `Approved. Application advanced to ${appl.stage}.`,
    data:    { applicationId: appl.applicationId, prevStage, newStage: appl.stage },
  });
});

/**
 * POST /api/workflow/:id/reject
 * Reject application — mandatory reason, dealer can re-submit from this stage.
 * Body: { reason (required), note? }
 */
app.post('/api/workflow/:id/reject', auth, (req, res) => {
  const appl = store.applications[req.params.id];
  const { reason, note } = req.body;

  if (!appl) return res.status(404).json({ success: false, error: 'Application not found' });
  if (!reason) return res.status(400).json({ success: false, error: 'reason is required for rejection' });

  const allowedRoles = ['sales','finance','legal','credit','it','admin'];
  if (!allowedRoles.includes(req.user.role))
    return res.status(403).json({ success: false, error: 'Only staff roles can reject' });

  const prevStage = appl.stage;
  appl.stage      = 'REJECTED';
  appl.rejectedBy = { role: req.user.role, userId: req.user.userId, at: new Date() };
  appl.rejectionReason     = reason;
  appl.resubmitFromStage   = prevStage;
  appl.resubmitDeadline    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  appl.resubmitAttemptsLeft = (appl.resubmitAttemptsLeft ?? 3) - 1;
  appl.updatedAt = new Date();

  appl.workflowHistory.push({
    stage: prevStage, action: 'REJECTED', by: req.user.userId, byName: req.user.name,
    dept: req.user.role, at: new Date(), reason, note: note || null,
  });

  store.notifications.push({
    to: appl.dealerId, type: 'SMS+PUSH+EMAIL', event: 'APPLICATION_REJECTED',
    message: `Your OBL application ${req.params.id} was rejected by ${req.user.role.toUpperCase()}. Reason: ${reason}. You have ${appl.resubmitAttemptsLeft} attempt(s) left.`,
    ts: new Date(),
  });

  res.json({
    success: true,
    message: 'Application rejected.',
    data: {
      applicationId:    appl.applicationId,
      reason,
      resubmitFromStage: prevStage,
      resubmitDeadline:  appl.resubmitDeadline,
      attemptsLeft:      appl.resubmitAttemptsLeft,
    },
  });
});

/**
 * POST /api/workflow/:id/rfi
 * Request For Information — sends message to dealer without stage change.
 * Body: { message (required) }
 */
app.post('/api/workflow/:id/rfi', auth, (req, res) => {
  const appl = store.applications[req.params.id];
  const { message } = req.body;

  if (!appl) return res.status(404).json({ success: false, error: 'Application not found' });
  if (!message) return res.status(400).json({ success: false, error: 'message is required for RFI' });

  appl.rfiHistory = appl.rfiHistory || [];
  appl.rfiHistory.push({ from: req.user.role, message, sentAt: new Date(), status: 'PENDING_DEALER_RESPONSE' });
  appl.updatedAt = new Date();

  store.notifications.push({
    to: appl.dealerId, type: 'SMS+PUSH+EMAIL', event: 'RFI_RECEIVED',
    message: `Information requested for your application ${req.params.id}: ${message}`,
    ts: new Date(),
  });

  res.json({ success: true, message: 'RFI sent to dealer.', data: { applicationId: appl.applicationId } });
});


// ════════════════════════════════════════════════════
// ██  ERP / BC 365 ROUTES
// ════════════════════════════════════════════════════

/**
 * POST /api/erp/:id/push
 * Push approved application data to Microsoft BC 365.
 * Only accessible by IT role or admin.
 */
app.post('/api/erp/:id/push', auth, async (req, res) => {
  const appl = store.applications[req.params.id];

  if (!appl) return res.status(404).json({ success: false, error: 'Application not found' });
  if (!['it','admin'].includes(req.user.role))
    return res.status(403).json({ success: false, error: 'Only IT/Admin can push to ERP' });
  if (appl.stage !== 'IT_ERP' && appl.stage !== 'APPROVED')
    return res.status(409).json({ success: false, error: `Application must be at IT_ERP stage (current: ${appl.stage})` });

  await delay(MOCK_MODE ? 1500 : 0);

  const biz   = appl.steps.step1_business || {};
  const bank  = appl.steps.step3_bank     || {};
  const type  = biz.entityType === 'Company' ? 'CORP' : biz.entityType === 'Individual' ? 'IND' : 'DLR';

  const dealerCode = generateDealerCode(type, biz.gstin || '');

  // BC 365 payload (OAuth 2.0 / Azure AD in production)
  const bcPayload = {
    displayName:         biz.legalName         || 'N/A',
    taxRegistrationNumber: biz.gstin           || 'N/A',
    customField_PAN:     biz.pan               || 'N/A',
    creditLimitLCY:      appl.creditLimit      || 500000,
    customerPriceGroup:  'DEALER-STD',
    paymentTermsCode:    bank.paymentTermsPref  || 'Net30',
    address: {
      street:    biz.registeredAddress?.line1  || '',
      city:      biz.registeredAddress?.city   || '',
      state:     biz.registeredAddress?.state  || '',
      postalCode: biz.registeredAddress?.pin   || '',
      country:   'IN',
    },
    no: dealerCode,
  };

  // Mock BC 365 API call (in production: POST to BC REST API v2.0)
  const mockBCResponse = {
    id:                 uid('BC-'),
    no:                 dealerCode,
    displayName:        bcPayload.displayName,
    lastModifiedDateTime: new Date(),
    status:             'Active',
  };

  // Update application
  appl.dealerCode  = dealerCode;
  appl.erpPushedAt = new Date();
  appl.erpResponse = mockBCResponse;
  appl.stage       = 'APPROVED';
  appl.updatedAt   = new Date();
  appl.workflowHistory.push({ stage: 'IT_ERP', action: 'ERP_PUSH', by: req.user.userId, byName: req.user.name, at: new Date(), dealerCode });

  // Welcome Kit dispatch log
  store.notifications.push({
    to: appl.dealerId, type: 'EMAIL+SMS', event: 'WELCOME_KIT',
    message: `Welcome to OBL! Your dealer code is ${dealerCode}. Credit limit: ${appl.creditLimit || 500000}. Payment terms: ${bcPayload.paymentTermsCode}. Welcome kit sent via email.`,
    attachments: ['welcome_kit.pdf'],
    ts: new Date(),
  });

  res.json({
    success: true,
    message: `Successfully pushed to BC 365. Dealer code: ${dealerCode}`,
    data: {
      applicationId: appl.applicationId,
      dealerCode,
      bcPayload,
      bcResponse: mockBCResponse,
      mockMode: MOCK_MODE,
    },
  });
});


// ════════════════════════════════════════════════════
// ██  NOTIFICATION ROUTES
// ════════════════════════════════════════════════════

/**
 * GET /api/notifications/log
 * Admin view of all notification dispatches.
 */
app.get('/api/notifications/log', auth, (req, res) => {
  if (!['admin','it'].includes(req.user.role))
    return res.status(403).json({ success: false, error: 'Admins only' });

  const { appId, limit = 50 } = req.query;
  let logs = [...store.notifications].reverse();
  if (appId) logs = logs.filter(n => n.to === appId || n.message?.includes(appId));

  res.json({ success: true, data: { total: logs.length, notifications: logs.slice(0, limit) } });
});

/**
 * POST /api/notifications/send
 * Manually trigger a notification (admin utility).
 * Body: { to, type, message }
 */
app.post('/api/notifications/send', auth, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ success: false, error: 'Admin only' });

  const { to, type = 'SMS', message } = req.body;
  if (!to || !message) return res.status(400).json({ success: false, error: 'to and message required' });

  const entry = { to, type, message, event: 'MANUAL', sentBy: req.user.userId, ts: new Date() };
  store.notifications.push(entry);

  res.json({ success: true, message: 'Notification queued.', data: entry });
});


// ════════════════════════════════════════════════════
// ██  ADMIN / DASHBOARD ROUTES
// ════════════════════════════════════════════════════

/**
 * GET /api/admin/kpi
 * KPI dashboard — total apps, by stage, TAT breaches, drop-off rate.
 */
app.get('/api/admin/kpi', auth, (req, res) => {
  if (!['admin','it'].includes(req.user.role))
    return res.status(403).json({ success: false, error: 'Admin only' });

  const apps   = Object.values(store.applications);
  const total  = apps.length;
  const byStage = {};
  STAGES.forEach(s => { byStage[s] = apps.filter(a => a.stage === s).length; });

  const approved   = apps.filter(a => a.stage === 'APPROVED').length;
  const rejected   = apps.filter(a => a.stage === 'REJECTED').length;
  const inProgress = total - approved - rejected;

  // TAT check per in-progress app
  const breaches = apps.filter(a => {
    if (!a.currentDept || !a.deptStartedAt) return false;
    const dept = DEPARTMENTS.find(d => d.id === a.currentDept);
    if (!dept || !dept.tatHours) return false;
    const s = tatStatus(a.deptStartedAt[a.currentDept], dept.tatHours);
    return ['BREACHED','SEVERE','CRITICAL'].includes(s);
  });

  res.json({
    success: true,
    data: {
      summary:     { total, approved, rejected, inProgress },
      byStage,
      tatBreaches: breaches.length,
      approvalRate: total > 0 ? `${Math.round((approved / total) * 100)}%` : 'N/A',
      kycPassRate:  '99.2%', // mock
      avgTATHours:  MOCK_MODE ? 31.4 : null,
      generatedAt:  new Date(),
    },
  });
});

/**
 * GET /api/admin/applications
 * Full application list with TAT status — for admin table view.
 */
app.get('/api/admin/applications', auth, (req, res) => {
  if (!['admin','sales','finance','legal','credit','it'].includes(req.user.role))
    return res.status(403).json({ success: false, error: 'Staff only' });

  const apps = Object.values(store.applications).map(a => {
    const dept = DEPARTMENTS.find(d => d.id === a.currentDept);
    const tat  = (dept && a.deptStartedAt?.[a.currentDept])
      ? tatStatus(a.deptStartedAt[a.currentDept], dept.tatHours)
      : 'N/A';
    return {
      applicationId: a.applicationId,
      dealerName:    a.dealerName,
      stage:         a.stage,
      currentDept:   a.currentDept,
      tatStatus:     tat,
      submittedAt:   a.submittedAt,
      dealerCode:    a.dealerCode || null,
    };
  });

  res.json({ success: true, data: { total: apps.length, applications: apps } });
});

/**
 * GET /api/admin/kyc-logs
 * Full KYC audit trail.
 */
app.get('/api/admin/kyc-logs', auth, (req, res) => {
  if (!['admin','finance','it'].includes(req.user.role))
    return res.status(403).json({ success: false, error: 'Access denied' });

  res.json({ success: true, data: { total: store.kycLogs.length, logs: store.kycLogs } });
});


// ─────────────────────────────────────────────
// 404 & GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error', detail: err.message });
});


// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  OBL SwiftOnboard API  ·  http://localhost:${PORT}  ║`);
    console.log(`║  MOCK_MODE: ${MOCK_MODE ? 'ON  (KYC & ERP simulated)  ' : 'OFF (live API mode)           '}║`);
    console.log(`╚══════════════════════════════════════════════╝\n`);
  });
}

module.exports = app;