# OBL SwiftOnboard — API Reference
## Mobile App Integration Guide · Multi-Step Form · v1.0

---

## Base URL
```
Local:      http://localhost:3000/api
Production: https://your-domain.com/api
```

All requests: `Content-Type: application/json`  
Protected routes: `Authorization: Bearer <token>`

---

## MOCK MODE
Set `MOCK_MODE=true` in `.env` (default ON).  
KYC APIs return realistic fake data. Aadhaar OTP code = `123456`.

---

## AUTH

### Register
```
POST /api/auth/register
Body: { name, email, password, role, mobile? }
Roles: dealer | sales | finance | legal | credit | it | admin
```

### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, userId, name, role }
```

---

## MULTI-STEP FORM FLOW (Mobile App)

```
Step 1 → PATCH /api/applications/:id/step  { step: 1, data: {...} }
Step 2 → POST  /api/kyc/pan  →  POST /api/kyc/gstin
       → POST  /api/kyc/aadhaar/send-otp  →  POST /api/kyc/aadhaar/verify-otp
       → PATCH /api/applications/:id/step  { step: 2, data: {...} }
Step 3 → GET   /api/kyc/ifsc/:code
       → POST  /api/kyc/penny-drop
       → PATCH /api/applications/:id/step  { step: 3, data: {...} }
Step 4 → Upload docs → PATCH /api/applications/:id/step  { step: 4, data: {...} }
Step 5 → PATCH /api/applications/:id/step  { step: 5, data: {...} }
Submit → POST  /api/applications/:id/submit
Track  → GET   /api/applications/:id/track
```

---

## STEP SCHEMAS

### Step 1 — Business & Entity Info
```json
{
  "entityType": "Company | Proprietorship | Partnership | LLP",
  "legalName": "MOCK ENTERPRISES PRIVATE LIMITED",
  "tradeName": "Mock Traders",
  "gstin": "29MOCKP0000A1Z5",
  "pan": "MOCKP0000A",
  "incorporationDate": "2019-04-01",
  "registeredAddress": {
    "line1": "123 MG Road",
    "line2": "Suite 4B",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pin": "560001"
  },
  "operatingAddress": { "...same structure..." },
  "yearsInBusiness": 6,
  "annualTurnover": "5-10Cr"
}
```

### Step 2 — KYC Verification (after running KYC APIs)
```json
{
  "panVerified": true,
  "gstinVerified": true,
  "aadhaarVerified": true,
  "passportNumber": "A1234567",
  "kycTransactionIds": {
    "pan": "PASS",
    "gstin": "PASS",
    "aadhaarTxnId": "AADHAAR-TXN-ABCD1234",
    "passport": "PASS"
  }
}
```

### Step 3 — Bank & Financial Info
```json
{
  "accountNumber": "012345678901",
  "ifsc": "HDFC0001234",
  "accountHolderName": "MOCK ENTERPRISES PRIVATE LIMITED",
  "bankName": "HDFC Bank",
  "branch": "Bengaluru Main",
  "pennyDropVerified": true,
  "creditLimitRequested": 1000000,
  "paymentTermsPref": "Net30"
}
```

### Step 4 — Documents Upload
```json
{
  "panCard":         { "url": "s3://bucket/pan.pdf",    "size": 204800, "mimeType": "application/pdf" },
  "gstCertificate":  { "url": "s3://bucket/gst.pdf",    "size": 512000, "mimeType": "application/pdf" },
  "aadhaarCard":     { "url": "s3://bucket/aadhar.jpg", "size": 102400, "mimeType": "image/jpeg" },
  "bankStatement":   { "url": "s3://bucket/bank.pdf",   "size": 307200, "mimeType": "application/pdf" },
  "addressProof":    { "url": "s3://bucket/addr.pdf",   "size": 153600, "mimeType": "application/pdf" },
  "partnershipDeed": null,
  "moa":             null
}
```

### Step 5 — Terms & Declaration
```json
{
  "agreeToTerms": true,
  "agreeToPrivacy": true,
  "declarationName": "John Doe",
  "declarationDate": "2025-03-15",
  "signatureBase64": "data:image/png;base64,..."
}
```

---

## KYC ENDPOINTS

### PAN Verification
```
POST /api/kyc/pan          (requires auth)
Body: { panNumber: "MOCKP0000A", applicationId?: "APP-..." }
Response:
  { panNumber, legalName, entityType, status: "Active", linkedGST: [...] }
Latency: ~800ms mock
Error: 422 if invalid format
```

### GSTIN Verification
```
POST /api/kyc/gstin        (requires auth)
Body: { gstin: "29MOCKP0000A1Z5", applicationId?: "APP-..." }
Response:
  { gstin, legalName, tradeName, registrationType, filingStatus,
    turnoverSlab, stateCode, stateName, registrationDate }
Latency: ~1.2s mock
Cached: 24h in production
```

### Aadhaar OTP — Send
```
POST /api/kyc/aadhaar/send-otp   (requires auth)
Body: { aadhaarNumber: "123412341234", applicationId?: "APP-..." }
Response:
  { txnId, maskedAadhaar: "XXXX XXXX 1234", otpExpiresInMin: 10 }
NOTE: In MOCK_MODE, OTP is always "123456"
```

### Aadhaar OTP — Verify
```
POST /api/kyc/aadhaar/verify-otp  (requires auth)
Body: { txnId: "AADHAAR-TXN-...", otp: "123456", applicationId?: "APP-..." }
Response:
  { verified: true, maskedName, maskedDOB, gender, address: { state, district, pincode } }
NOTE: Full Aadhaar never stored — DPDP & RBI compliant
```

### Penny Drop (Bank Verification)
```
POST /api/kyc/penny-drop    (requires auth)
Body: { accountNumber, ifsc, accountHolderName, applicationId? }
Response:
  { verified: true, nameMatch: "FULL|PARTIAL|MISMATCH", nameMatchScore: 98,
    registeredName, transactionRef, amountDropped: 1.00 }
Latency: ~2s mock
```

### IFSC Lookup
```
GET /api/kyc/ifsc/:ifscCode  (no auth needed)
Example: GET /api/kyc/ifsc/HDFC0001234
Response:
  { ifsc, bank, branch, city, state, micr }
Latency: ~500ms mock
```

### Passport Verification (optional)
```
POST /api/kyc/passport      (requires auth)
Body: { passportNumber: "A1234567", dob: "1985-06-15", name?, applicationId? }
Response:
  { passportNumber, name, dob, nationality, gender, issueDate, expiryDate,
    issuingAuthority, status: "VALID" }
Latency: ~1.5s mock
```

---

## APPLICATION TRACKER

```
GET /api/applications/:id/track
Response:
{
  "applicationId": "APP-...",
  "currentStage": "SALES_REVIEW",
  "completion": 50,
  "estimatedTATHours": 48,
  "submittedAt": "2025-03-15T10:00:00Z",
  "timeline": [
    { "stage": "DRAFT",         "status": "COMPLETED", "completedAt": "..." },
    { "stage": "SUBMITTED",     "status": "COMPLETED", "completedAt": "..." },
    { "stage": "KYC_COMPLETE",  "status": "COMPLETED", "completedAt": "..." },
    { "stage": "SALES_REVIEW",  "status": "IN_PROGRESS", "completedAt": null },
    { "stage": "FINANCE_REVIEW","status": "PENDING",  "completedAt": null },
    { "stage": "LEGAL_REVIEW",  "status": "PENDING",  "completedAt": null },
    { "stage": "CREDIT_REVIEW", "status": "PENDING",  "completedAt": null },
    { "stage": "IT_ERP",        "status": "PENDING",  "completedAt": null },
    { "stage": "APPROVED",      "status": "PENDING",  "completedAt": null }
  ],
  "dealerCode": null
}
```

---

## WORKFLOW (Internal Staff)

### Approve Stage
```
POST /api/workflow/:id/approve
Auth: Sales | Finance | Legal | Credit | IT | Admin
Body: { note?: "Looks good", creditLimit?: 750000 }
Response: { prevStage, newStage }
```

### Reject Application
```
POST /api/workflow/:id/reject
Auth: Staff roles
Body: { reason: "GSTIN mismatch with PAN", note?: "..." }
Response: { reason, resubmitFromStage, resubmitDeadline, attemptsLeft }
Rules: 7-day window, max 3 attempts, resumes from rejected stage
```

### Request For Information
```
POST /api/workflow/:id/rfi
Auth: Staff roles
Body: { message: "Please provide latest bank statement for past 6 months" }
Dealer notified via SMS+Email+Push
```

---

## ERP — BC 365 PUSH (IT only)

```
POST /api/erp/:id/push
Auth: IT | Admin (application must be at IT_ERP stage)
Response:
{
  "dealerCode": "OBL-DLR-29-4721",
  "bcPayload": {
    "displayName": "MOCK ENTERPRISES PVT LTD",
    "taxRegistrationNumber": "29MOCKP0000A1Z5",
    "customField_PAN": "MOCKP0000A",
    "creditLimitLCY": 750000,
    "customerPriceGroup": "DEALER-STD",
    "paymentTermsCode": "Net30",
    "address": { "city": "Bengaluru", "state": "Karnataka", ... },
    "no": "OBL-DLR-29-4721"
  }
}
Dealer Code Format: OBL-{TYPE}-{STATE_CODE}-{4DIGIT_SEQ}
Types: DLR (Dealer) | CORP (Corporate) | IND (Individual)
```

---

## AUTO-ESCALATION RULES

| TAT %    | Action                            |
|----------|-----------------------------------|
| 80%      | Reminder SMS to assignee          |
| 100%     | Dept Head — SMS + Email + Push    |
| 150%     | + Ops Manager CC'd                |
| 200%     | CRITICAL → Super Admin            |

TAT per department:
- Sales: 4 hours
- Finance & KYC: 8 hours
- Legal: 4 hours
- Credit Control: 4 hours
- IT / ERP: 2 hours

---

## SECURITY NOTES
- All KYC API calls are server-side only — zero keys in app bundle
- Aadhaar numbers never stored — masked XXXX XXXX XXXX only
- AES-256 encryption for PII at rest
- TLS 1.3 on all channels
- JWT tokens: HMAC-SHA256 signed
- KYC logs retained 7 years (compliance)

---

## QUICK START

```bash
npm init -y
npm install express cors
NODE_ENV=development MOCK_MODE=true node server.js
```

Test:
```bash
# Register a dealer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Dealer","email":"dealer@test.com","password":"pass123","role":"dealer"}'

# Create application
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer <token>"

# Verify PAN
curl -X POST http://localhost:3000/api/kyc/pan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"panNumber":"ABCDE1234F"}'
```