# 🧱 OBL SwiftOnboard
### Orientbell Limited — Hackathon 2025

> **"From Paper Chaos to Digital Flow"** — A mobile-first dealer onboarding ecosystem built with Expo + React Native that eliminates manual KYC, automates multi-department approvals, and integrates directly with Microsoft Business Central 365.

---

## 🏆 Hackathon Submission

| Field | Detail |
|---|---|
| **Event** | Orientbell Limited Internal Hackathon 2025 |
| **Team** | OBL SwiftOnboard |
| **Track** | Digital Transformation / Process Automation |
| **Stack** | Expo (React Native) · Node.js · REST KYC APIs · MS BC 365 |

---

## 🎯 Problem We Solved

| Before (Manual) | After (SwiftOnboard) |
|---|---|
| 7–14 days average TAT | **< 48 hours** end-to-end |
| 6+ physical forms & couriers | **Zero paper** — 100% digital |
| Manual data re-entry into ERP | **Auto-push** to BC 365 on approval |
| No dealer visibility | **Real-time tracker** at every stage |
| Error-prone KYC by email | **Live API verification** (PAN/GST/Aadhaar/Bank) |
| Missed SLAs, no escalations | **Auto-escalation** after TAT breach |

---

## 📱 App Features

### Dealer / Customer App
- 🔐 Secure OTP-based login (mobile number)
- 📋 5-step guided onboarding form
- 🤳 **Camera-based document scan** with auto OCR fill
- ✅ Real-time KYC: PAN · Aadhaar · GST · Penny Drop
- 📍 Live application tracker with department-wise progress
- 🔔 Push notifications at every stage change
- 📦 Digital Welcome Kit on approval

### Admin / Internal Dashboard
- 📊 Centralized pipeline view (all departments)
- 🔄 Approval workflow: Sales → Finance → Legal → Credit Control → IT
- ⏱️ TAT monitoring with auto-escalation alerts
- 🔍 OCR data vs. uploaded doc side-by-side comparison
- 🏢 One-click ERP push to Microsoft BC 365
- 📈 Analytics: conversion rates, avg TAT, bottlenecks

---

## 🗂️ Repo Structure

```
obl-swiftonboard/
│
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.jsx         # Animated brand splash
│   │   │   ├── LoginScreen.jsx          # Mobile OTP login
│   │   │   └── OTPVerifyScreen.jsx      # OTP entry
│   │   │
│   │   ├── dealer/
│   │   │   ├── HomeScreen.jsx           # Dealer dashboard
│   │   │   ├── Step1_BusinessInfo.jsx   # Business details form
│   │   │   ├── Step2_KYCVerify.jsx      # PAN / Aadhaar / GST
│   │   │   ├── Step3_BankDetails.jsx    # Bank + Penny Drop
│   │   │   ├── Step4_Documents.jsx      # Camera scan + upload
│   │   │   ├── Step5_Declaration.jsx    # Digital sign-off
│   │   │   ├── SubmitSuccess.jsx        # Confirmation screen
│   │   │   └── ApplicationTracker.jsx  # Real-time status
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx       # KPI overview
│   │       ├── ApplicationList.jsx      # Pipeline table
│   │       ├── ApplicationDetail.jsx    # Review + approve
│   │       ├── KYCReviewPanel.jsx       # OCR vs doc compare
│   │       └── ERPIntegration.jsx       # BC 365 push panel
│   │
│   ├── components/
│   │   ├── FormInput.jsx                # Reusable input with validation
│   │   ├── VerifyButton.jsx             # KYC verify button + badge
│   │   ├── ProgressStepper.jsx          # 5-step progress bar
│   │   ├── DocumentUploader.jsx         # Camera / gallery + OCR
│   │   ├── StatusPill.jsx               # Coloured status badge
│   │   ├── WorkflowTimeline.jsx         # Dept approval timeline
│   │   ├── KPICard.jsx                  # Dashboard metric card
│   │   └── ToastNotification.jsx        # In-app toast alerts
│   │
│   ├── navigation/
│   │   ├── RootNavigator.jsx            # Auth vs App stack switch
│   │   ├── DealerStack.jsx              # Dealer tab + stack nav
│   │   └── AdminStack.jsx               # Admin tab + stack nav
│   │
│   ├── services/
│   │   ├── kycService.js                # PAN · GST · Aadhaar · Bank APIs
│   │   ├── erpService.js                # Microsoft BC 365 bridge
│   │   ├── notificationService.js       # SMS / Email / Push
│   │   ├── storageService.js            # Secure PII storage (expo-secure-store)
│   │   └── apiClient.js                 # Axios base client + interceptors
│   │
│   ├── hooks/
│   │   ├── useKYCVerification.js        # KYC state machine hook
│   │   ├── useApplicationForm.js        # Multi-step form state
│   │   └── useDocumentScanner.js        # Camera + OCR hook
│   │
│   ├── utils/
│   │   ├── validators.js                # PAN/GST/IFSC format validators
│   │   ├── formatters.js                # Currency, date formatters
│   │   └── encryption.js               # AES-256 PII field encryption
│   │
│   └── constants/
│       ├── theme.js                     # Colors, fonts, spacing
│       ├── apiEndpoints.js              # All API URLs
│       └── workflowConfig.js            # Dept routing rules + TAT limits
│
├── assets/
│   ├── obl-logo.png
│   └── splash.png
│
├── app.json                             # Expo config
├── App.jsx                              # Root entry point
├── package.json
├── .env.example                         # API keys template (never commit real keys)
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_TEAM/obl-swiftonboard.git
cd obl-swiftonboard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your KYC API keys (see docs/API_SETUP.md)

# 4. Start Expo dev server
npx expo start

# Scan QR with Expo Go app on your phone
# OR press 'a' for Android emulator / 'i' for iOS simulator
```

---

## 🔌 KYC API Integrations

| Document | Provider | Method | Response Time |
|---|---|---|---|
| PAN | Sandbox KYC API | GET /pan/verify | ~800ms |
| GST | GSTN Official API | GET /gst/verify | ~1.2s |
| Aadhaar | DigiLocker / UIDAI | OTP-based flow | ~3s |
| Bank Account | Penny Drop (Razorpay / Cashfree) | POST /bank/verify | ~2s |
| Passport | Govt. Verification API | GET /passport/verify | ~1.5s |

> **Note:** For the hackathon demo, all APIs run against sandbox/mock endpoints. See `src/services/kycService.js` for integration points.

---

## 🏢 ERP Integration (Microsoft BC 365)

```
Approved Application
        ↓
src/services/erpService.js
        ↓
POST /BC365/api/v2.0/companies/{id}/customers
        ↓
Auto-generates:
  - Customer/Dealer Code (OBL-DLR-XX-XXXX)
  - Credit Limit assignment
  - Customer Group mapping
  - Welcome Kit trigger
```

---

## 🔒 Security & Compliance

- **PII Encryption:** All Aadhaar, PAN, Bank data encrypted with AES-256 before storage
- **Secure Storage:** `expo-secure-store` for device-level token storage (not AsyncStorage)
- **API Auth:** JWT bearer tokens with 15-min expiry + refresh token rotation
- **Masking:** Aadhaar displayed as `XXXX XXXX 5432` throughout the app
- **Audit Trail:** Every KYC verification and approval logged with timestamp + user ID
- **No PII in logs:** Custom logger strips sensitive fields before console output

---

## 🔄 Approval Workflow Logic

```
Application Submitted
        ↓
[AUTO] KYC Verification APIs
        ↓ Pass / Fail
Sales Manager Review         ← TAT: 4 hours
        ↓
Finance & KYC Team           ← TAT: 8 hours
        ↓
Legal & Compliance           ← TAT: 4 hours
        ↓
Credit Control               ← TAT: 4 hours
        ↓
IT / ERP Integration         ← TAT: 2 hours
        ↓
🎉 Welcome Kit Dispatched

⚠️ TAT Breach → Auto-escalation to Dept Head (SMS + Email + Push)
❌ Rejection → Applicant notified + guided re-submission flow
```

---

## 📊 Impact Metrics (Projected)

| Metric | Before | After | Improvement |
|---|---|---|---|
| Avg. Onboarding TAT | 7–14 days | < 48 hours | **~90% faster** |
| Manual data entry steps | 14 touchpoints | 0 | **100% eliminated** |
| KYC error rate | ~12% | < 1% | **92% reduction** |
| Dealer drop-off rate | ~35% | < 5% | **85% improvement** |
| ERP entry time | 45 min/app | < 5 min | **89% faster** |

---

## 👥 Team

| Name | Role |
|---|---|
| [Your Name] | Lead Developer · React Native + API Integration |
| [Team Member 2] | Backend · Node.js + KYC Services |
| [Team Member 3] | UI/UX Design + Admin Dashboard |

---

## 📄 License

Internal hackathon project — Orientbell Limited © 2025

---

*Built with ❤️ for Orientbell Limited Hackathon 2025 — "Out of the Box Thinking"*
