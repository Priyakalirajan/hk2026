/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         OBL SwiftOnboard — Full Backend API Server           ║
 * ║         PostgreSQL Integration · Node 20 LTS (LOCAL ONLY)    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const crypto   = require('crypto');
const cron     = require('node-cron');
const db       = require('./db');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const MOCK_MODE  = process.env.MOCK_MODE !== 'false';
const JWT_SECRET = process.env.JWT_SECRET || 'obl_swiftonboard_dev_secret_2025';

// ─────────────────────────────────────────────
// AUTOMATED TAT ESCALATION SERVICE
// ─────────────────────────────────────────────
cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Checking for TAT Escalations...');
  try {
    const { rows } = await db.query(`SELECT application_id, stage, updated_at FROM applications WHERE stage NOT IN ('DRAFT', 'APPROVED', 'REJECTED')`);
    
    const SLAs = { 'SALES_REVIEW': 4, 'FINANCE_REVIEW': 8, 'LEGAL_REVIEW': 4, 'CREDIT_REVIEW': 4, 'IT_ERP': 2 };

    const now = new Date();
    for (const app of rows) {
      if (!app.updated_at) continue;
      const hoursPending = (now - new Date(app.updated_at)) / (1000 * 60 * 60);
      const limit = SLAs[app.stage] || 24;
      
      if (hoursPending > limit) {
         await db.query(`INSERT INTO notifications (user_id, type, event, message) VALUES ($1, $2, $3, $4)`,
           ['ADMIN', 'ESCALATION', 'TAT_BREACH', `Application ${app.application_id} has breached TAT limit in stage ${app.stage} (${Math.round(hoursPending)}h > ${limit}h)`]
         );
         console.warn(`[ESCALATION] App ${app.application_id} breached TAT.`);
      }
    }
  } catch(e) { console.error('Cron error', e); }
});

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const uid = (prefix = '') => prefix + crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 16);

const signToken = (payload) => {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
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

const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '').trim();

  // Hackathon/Demo Bypass
  if (token === 'mock') {
    req.user = { user_id: 'USR-MOCK-001', name: 'Demo Dealer', role: 'admin' };
    return next();
  }

  const userData = verifyToken(token);
  if (!userData) return res.status(401).json({ success: false, error: 'Unauthorized — invalid or missing token' });
  
  try {
    const { rows } = await db.query('SELECT user_id, name, email, role FROM users WHERE user_id = $1', [userData.userId]);
    if (rows.length === 0) return res.status(401).json({ success: false, error: 'User no longer exists' });
    req.user = rows[0];
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error during auth' });
  }
};

const generateDealerCode = (type = 'DLR', gstin = '') => {
  const stateCode = gstin.slice(0, 2) || 'XX';
  const seq = String(Math.floor(1000 + Math.random() * 8999));
  return `OBL-${type.toUpperCase()}-${stateCode}-${seq}`;
};

const nextStage = (current) => {
  const order = ['SALES_REVIEW','FINANCE_REVIEW','LEGAL_REVIEW','CREDIT_REVIEW','IT_ERP','APPROVED'];
  const idx = order.indexOf(current);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : 'APPROVED';
};

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

app.get('/api', (_req, res) => {
  res.json({ success: true, service: 'OBL SwiftOnboard Local API', version: '2.0.0', mockMode: MOCK_MODE });
});

// ════════════════════════════════════════════════════
// ██  AUTH ROUTES
// ════════════════════════════════════════════════════
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'dealer', mobile } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, error: 'name, email and password are required' });

  try {
    const check = await db.query('SELECT email FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) return res.status(409).json({ success: false, error: 'Email already registered' });

    const userId = uid('USR-');
    const hash = crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
    
    await db.query(
      'INSERT INTO users (user_id, name, email, mobile, role, password_hash) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, name, email, mobile || '', role, hash]
    );

    const token = signToken({ userId, email, role, name });
    res.status(201).json({ success: true, data: { userId, name, email, role, token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'email and password required' });

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    
    const user = rows[0];
    const hash = crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
    if (hash !== user.password_hash) return res.status(401).json({ success: false, error: 'Invalid password' });

    const token = signToken({ userId: user.user_id, email: user.email, role: user.role, name: user.name });
    res.json({ success: true, data: { userId: user.user_id, name: user.name, email: user.email, role: user.role, token } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT user_id, name, email, role, created_at FROM users WHERE user_id = $1', [req.user.user_id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error' });
  }
});

// ════════════════════════════════════════════════════
// ██  KYC ROUTES (LOCAL MOCK ONLY)
// ════════════════════════════════════════════════════
app.post('/api/kyc/pan', auth, async (req, res) => {
  const { panNumber, applicationId } = req.body;
  if (!panNumber) return res.status(400).json({ success: false, error: 'panNumber required' });
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber.toUpperCase())) return res.status(422).json({ success: false, error: 'Invalid PAN format' });

  try {
    await delay(800);
    const result = { panNumber: panNumber.toUpperCase(), legalName: 'SHARMA TILES & INTERIORS', status: 'VALID', entityCategory: 'Company', mockMode: true };
    await db.query('INSERT INTO kyc_logs (type, reference_id, application_id, result, details) VALUES ($1, $2, $3, $4, $5)', 
      ['PAN', panNumber.toUpperCase(), applicationId, 'PASS', JSON.stringify(result)]);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Error' });
  }
});

app.post('/api/kyc/gstin', auth, async (req, res) => {
  const { gstin, applicationId } = req.body;
  if (!gstin) return res.status(400).json({ success: false, error: 'gstin required' });
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.toUpperCase())) return res.status(422).json({ success: false, error: 'Invalid GSTIN format' });

  try {
    await delay(1200);
    const result = { gstin: gstin.toUpperCase(), legalName: 'SHARMA TILES & INTERIORS', tradeName: 'SHARMA TILES', status: 'Active', stateCode: gstin.substring(0,2), mockMode: true };
    await db.query('INSERT INTO kyc_logs (type, reference_id, application_id, result, details) VALUES ($1, $2, $3, $4, $5)', 
      ['GSTIN', gstin.toUpperCase(), applicationId, 'PASS', JSON.stringify(result)]);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Error' });
  }
});

// ════════════════════════════════════════════════════
// ██  AADHAAR (LOCAL MOCK ONLY)
// ════════════════════════════════════════════════════
app.post('/api/kyc/aadhaar/send-otp', auth, async (req, res) => {
  const { aadhaarNumber, applicationId } = req.body;
  if (!aadhaarNumber) return res.status(400).json({ success: false, error: 'aadhaarNumber required' });
  
  const clean = aadhaarNumber.replace(/\s/g, '');
  if (!/^\d{12}$/.test(clean)) return res.status(422).json({ success: false, error: 'Aadhaar must be 12 digits' });

  try {
    await delay(800);
    const txnId = uid('AADHAAR-TXN-');
    const masked = 'XXXX XXXX ' + clean.slice(8);
    await db.query('INSERT INTO kyc_logs (type, reference_id, application_id, result, details) VALUES ($1, $2, $3, $4, $5)', 
      ['AADHAAR_OTP_SEND', txnId, applicationId, 'PENDING', JSON.stringify({ masked, ttlMin: 10 })]);
    
    // Both login bypass & regular flow return same mock OTP success
    res.json({ success: true, message: 'Mock OTP sent (use 123456)', data: { txnId, maskedAadhaar: masked } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Error' });
  }
});

app.post('/api/kyc/aadhaar/verify-otp', auth, async (req, res) => {
  const { txnId, otp, applicationId } = req.body; 
  if (!txnId) return res.status(400).json({ success: false, error: 'txnId (requestId) required' });

  try {
    await delay(1000);
    const isValid = otp === '123456';
    if (!isValid) return res.status(422).json({ success: false, error: 'Invalid Demo OTP. Use 123456' });

    const result = { verified: true, txnId, maskedName: 'RAJESH S***', address: { state: 'Karnataka', pincode: '560001' }, mockMode: true };

    await db.query('INSERT INTO kyc_logs (type, reference_id, application_id, result, details) VALUES ($1, $2, $3, $4, $5)', 
      ['AADHAAR_OTP_VERIFY', txnId, applicationId, 'PASS', JSON.stringify(result)]);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Error' });
  }
});

app.post('/api/kyc/penny-drop', auth, async (req, res) => {
  const { accountNumber, ifsc, accountHolderName, applicationId } = req.body;
  if (!accountNumber || !ifsc || !accountHolderName) return res.status(400).json({ success: false, error: 'Missing bank details' });

  try {
    await delay(2000);
    const result = { verified: true, accountNumber: '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4), ifsc: ifsc.toUpperCase(), nameMatch: 'FULL', registeredName: accountHolderName.toUpperCase(), mockMode: true };

    await db.query('INSERT INTO kyc_logs (type, reference_id, application_id, result, details) VALUES ($1, $2, $3, $4, $5)', 
      ['PENNY_DROP', accountNumber, applicationId, 'PASS', JSON.stringify(result)]);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Error' });
  }
});

app.get('/api/kyc/ifsc/:code', async (req, res) => {
  const { code } = req.params;
  await delay(500);
  res.json({ success: true, data: { ifsc: code.toUpperCase(), bank: 'STATE BANK OF INDIA', branch: 'CENTRAL BRANCH', city: 'GURUGRAM', mockMode: true } });
});

app.post('/api/kyc/passport', auth, async (req, res) => {
  const { passportNumber, dob, name, applicationId, txnId } = req.body;
  
  if (!passportNumber || !dob) return res.status(400).json({ success: false, error: 'passportNumber and dob required' });
  if (!/^[A-Z][0-9]{7}$/.test(passportNumber.toUpperCase())) return res.status(422).json({ success: false, error: 'Invalid passport format' });

  try {
    await delay(1500);
    const result = { passportNumber: passportNumber.toUpperCase(), name: name || 'DIRECTOR NAME', dob, status: 'VALID', mockMode: true };

    await db.query('INSERT INTO kyc_logs (type, reference_id, application_id, result, details) VALUES ($1, $2, $3, $4, $5)', 
      ['PASSPORT', passportNumber.toUpperCase(), applicationId, 'PASS', JSON.stringify(result)]);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Error' });
  }
});

// ════════════════════════════════════════════════════
// ██  APPLICATION ROUTES
// ════════════════════════════════════════════════════
app.post('/api/applications', auth, async (req, res) => {
  const appId = uid('APP-');
  try {
    await db.query(
      'INSERT INTO applications (application_id, dealer_id, dealer_name, stage) VALUES ($1, $2, $3, $4)',
      [appId, req.user.user_id, req.user.name, 'DRAFT']
    );
    res.status(201).json({ success: true, data: { applicationId: appId, stage: 'DRAFT' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error' });
  }
});

app.get('/api/applications/:id', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM applications WHERE application_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    const appl = rows[0];
    
    if (appl.dealer_id !== req.user.user_id && !['sales','finance','legal','credit','it','admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    res.json({ success: true, data: appl });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error' });
  }
});

app.patch('/api/applications/:id/step', auth, async (req, res) => {
  const { step, data } = req.body;
  if (![1,2,3,4,5].includes(Number(step))) return res.status(400).json({ success: false, error: 'step must be 1-5' });
  
  try {
    const { rows } = await db.query('SELECT dealer_id, stage FROM applications WHERE application_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    if (rows[0].dealer_id !== req.user.user_id) return res.status(403).json({ success: false, error: 'Access denied' });
    if (!['DRAFT', 'REJECTED'].includes(rows[0].stage)) return res.status(409).json({ success: false, error: 'Cannot edit in this stage' });

    const stepCol = ['step1_business','step2_kyc','step3_bank','step4_docs','step5_terms'][step - 1];
    
    await db.query(
      `UPDATE applications SET ${stepCol} = COALESCE(${stepCol}, '{}'::jsonb) || $1::jsonb, last_saved_at = NOW(), updated_at = NOW() WHERE application_id = $2`,
      [JSON.stringify(data), req.params.id]
    );
    
    res.json({ success: true, message: `Step ${step} auto-saved` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error : '  + err.message});
  }
});

app.post('/api/applications/:id/submit', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM applications WHERE application_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    if (rows[0].dealer_id !== req.user.user_id) return res.status(403).json({ success: false, error: 'Access denied' });
    
    const history = rows[0].workflow_history || [];
    history.push({ stage: 'SUBMITTED', by: req.user.user_id, at: new Date(), note: 'Dealer submitted' });

    await db.query(
      `UPDATE applications SET stage = 'SUBMITTED', submitted_at = NOW(), workflow_history = $1::jsonb WHERE application_id = $2`,
      [JSON.stringify(history), req.params.id]
    );

    setTimeout(async () => {
      const hist2 = [...history, { stage: 'KYC_COMPLETE', by: 'SYSTEM', at: new Date(), note: 'Auto-KYC passed. Routed to Sales.' }];
      await db.query(
        `UPDATE applications SET stage = 'SALES_REVIEW', current_dept = 'sales', workflow_history = $1::jsonb WHERE application_id = $2`,
        [JSON.stringify(hist2), req.params.id]
      );
    }, 3000);

    res.json({ success: true, message: 'Application submitted. KYC verification started.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error' });
  }
});

app.get('/api/applications/:id/track', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT stage, submitted_at, workflow_history FROM applications WHERE application_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    
    const appl = rows[0];
    const stageOrder = ['DRAFT','SUBMITTED','KYC_IN_PROGRESS','KYC_COMPLETE','SALES_REVIEW','FINANCE_REVIEW','LEGAL_REVIEW','CREDIT_REVIEW','IT_ERP','APPROVED'];
    const currentIdx = Math.max(0, stageOrder.indexOf(appl.stage));
    const history = appl.workflow_history || [];

    const timeline = stageOrder.map((s, i) => ({
      stage: s,
      label: s.replace(/_/g, ' '),
      status: i < currentIdx ? 'COMPLETED' : i === currentIdx ? 'IN_PROGRESS' : 'PENDING',
      completedAt: history.find(h => h.stage === s)?.at || null
    }));

    res.json({ success: true, data: { applicationId: req.params.id, currentStage: appl.stage, completion: Math.round((currentIdx / 9)*100), timeline, submittedAt: appl.submitted_at }});
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error' });
  }
});

app.get('/api/applications', auth, async (req, res) => {
  try {
    let query = 'SELECT application_id, dealer_name, stage, created_at, updated_at, step1_business FROM applications ORDER BY updated_at DESC';
    let params = [];
    
    if (req.user.role === 'dealer') {
      query = 'SELECT application_id, dealer_name, stage, created_at, updated_at, step1_business FROM applications WHERE dealer_id = $1 ORDER BY updated_at DESC';
      params = [req.user.user_id];
    }
    
    const { rows } = await db.query(query, params);
    
    const mapped = rows.map(r => ({
      id: r.application_id,
      dealer: r.step1_business?.name || r.dealer_name || 'Pending Details',
      status: r.stage,
      date: r.created_at,
      flagged: false,
      type: "Dealer"
    }));
    
    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error' });
  }
});

// ════════════════════════════════════════════════════
// ██  WORKFLOW ROUTES
// ════════════════════════════════════════════════════
app.post('/api/workflow/:id/approve', auth, async (req, res) => {
  const allowed = ['sales','finance','legal','credit','it','admin'];
  if (!allowed.includes(req.user.role)) return res.status(403).json({ success: false, error: 'Staff only' });

  try {
    const { rows } = await db.query('SELECT stage, workflow_history FROM applications WHERE application_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    
    const appl = rows[0];
    const next = nextStage(appl.stage);
    const history = appl.workflow_history || [];
    history.push({ stage: appl.stage, action: 'APPROVED', by: req.user.user_id, note: req.body.note, at: new Date() });

    await db.query(
      `UPDATE applications SET stage = $1, workflow_history = $2::jsonb, updated_at = NOW() WHERE application_id = $3`,
      [next, JSON.stringify(history), req.params.id]
    );

    res.json({ success: true, data: { prevStage: appl.stage, newStage: next } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error' });
  }
});

// ════════════════════════════════════════════════════
// ██  ERP INTEGRATION ROUTES (LOCAL MOCK)
// ════════════════════════════════════════════════════
app.post('/api/erp/:id/push', auth, async (req, res) => {
  if (req.user.role !== 'it' && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'IT role only' });

  try {
    const { rows } = await db.query('SELECT * FROM applications WHERE application_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    
    const appl = rows[0];
    const gstin = appl.step1_business?.gstin || '29XX';
    const dealerCode = generateDealerCode('DLR', gstin);

    await delay(2000); // Simulate Local ERP Push

    const history = appl.workflow_history || [];
    history.push({ stage: appl.stage, action: 'ERP_PUSHED', by: req.user.user_id, note: `Generated code: ${dealerCode}`, at: new Date() });

    await db.query(
      `UPDATE applications SET stage = 'APPROVED', workflow_history = $1::jsonb, updated_at = NOW() WHERE application_id = $2`,
      [JSON.stringify(history), req.params.id]
    );

    await db.query(`INSERT INTO notifications (user_id, type, event, message) VALUES ($1, $2, $3, $4)`,
       [appl.dealer_id, 'SYSTEM', 'ERP_INTEGRATION_SUCCESS', `Congratulations! Your Dealer Code is ${dealerCode}. Your digital Welcome Kit has been dispatched.`]
    );

    res.json({ success: true, data: { dealerCode, pushedAt: new Date(), message: 'Successfully pushed to Mock ERP & Welcome Kit dispatched' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend Server running on port ${PORT}`);
  console.log(`💡 MOCK_MODE: ${MOCK_MODE}`);
  console.log(`🐘 POSTGRES: Configured and Ready`);
});