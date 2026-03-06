# Software Requirements Specification (SRS)
**Digital Dealer & Customer Onboarding Platform**
**Orientbell Limited | Hackathon 2025**
**Version:** 1.0 (March 2025)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for the **OBL SwiftOnboard platform** — a mobile-first, end-to-end digital onboarding solution developed for Orientbell Limited as part of the 2025 Internal Hackathon.

### 1.2 Scope / Problem Statement
Orientbell Limited frequently partners with new dealers and corporate customers. Currently, the onboarding process is a fragmented, paper-heavy exercise requiring manual data entry and physical document handling. This leads to:
*   Significant delays (TAT of 7-14 days).
*   High human error rates.
*   A lack of transparency for new partners.
*   Slow "time-to-market" for new business relationships.

**OBL SwiftOnboard** addresses this by providing:
*   **Digital Self-Service Onboarding:** A web/mobile interface to digitally submit profiles and supporting documents, eliminating hard-copy forms.
*   **Automated KYC & Data Verification:** Real-time API validation of PAN, GST, Aadhaar, Passport, and Bank Accounts (Penny Drop).
*   **Cross-Functional Approval Workflow:** Automated routing through Sales → Finance & KYC → Legal → Credit Control → IT.
*   **Custom Admin Panel & DB:** Verified data is stored securely in a custom PostgreSQL database managed via the admin panel.
*   **Communication & Visibility Engine:** Automated SMS/Email notifications and a real-time "Application Tracker".

---

## 2. Overall System Description

### 2.1 Product Perspective
OBL SwiftOnboard replaces the manual paper-based process. It operates as a hub connecting the Dealer-facing mobile app (React Native), Internal Admin dashboard (React Web App), Third-party KYC Verification APIs, PostgreSQL Database, and Notification gateways (MSG91/SendGrid).

### 2.2 Objective to provide to Customers & Internal Teams
1.  **Customer Portal/Mobile App:** Secure login to upload documents and track status.
2.  **Centralized Verification Dashboard (Separate Web App):** A dedicated web application for internal teams (Finance, Legal, etc.) to view OCR-extracted data alongside uploaded images, process approvals, and manage queues.
3.  **Automated Escalations:** Alerts for TAT breaches.
4.  **Final Welcome Kit:** Auto-generation of dealer code and digital welcome kit upon database insertion.

---

## 3. Functional Requirements

### 3.1 Authentication & User Management
*   **FR-AUTH-01:** OTP-based mobile number login for dealers.
*   **FR-AUTH-02:** Role-based access (Dealer, Sales, Finance, Legal, Credit, IT).

### 3.2 Digital Onboarding — Dealer Portal
*   **FR-FORM-01:** 5-step guided form: (1) Business Info, (2) KYC Verification, (3) Bank & GST Details, (4) Document Upload, (5) Declaration.
*   **FR-FORM-02:** Auto-save progress every 60 seconds.
*   **FR-FORM-09/10:** Regex validation for PAN and GSTIN before API calls.

### 3.3 KYC & Document Verification
*   **FR-KYC-01/02:** Integrate PAN, GSTIN, and Passport verification APIs.
*   **FR-KYC-03:** Aadhaar verification via OTP. Aadhaar numbers must be masked (XXXX XXXX XXXX).
*   **FR-KYC-04:** Bank account verification via Penny Drop method.

### 3.4 Approval Workflow
*   **FR-WF-01/02:** Auto-routing: Sales (4h) → Finance (8h) → Legal (4h) → Credit Control (4h) → IT (2h).
*   **FR-WF-03/04:** Ability to Approve, Reject, or Request Info. Rejections include reasons and resubmission links.
*   **FR-WF-05:** Escalation alerts to department heads on TAT breaches (80%, 100%, 150%, 200%).

### 3.5 Database Integration (PostgreSQL)
*   **FR-DB-01/02:** Push approved data to create a Customer Record securely inside the PostgreSQL database.
*   **FR-ERP-03:** Auto-generate unique Dealer Code: `OBL-{TYPE}-{STATE}-{4DIGIT}`.

### 3.6 Application Tracker & Communications
*   **FR-TRACK-02:** Timeline showing submission, KYC, departmental approvals, and Database insertion.
*   **FR-COMM-01/02:** Automated SMS and Email at every status change.

---

## 4. "Out of the Box" (Innovative Hackathon Features)
To exceed the standard evaluation criteria and provide a truly next-generation experience, the following features are included:
*   **AI-Powered Auto-Fill (Vision OCR):** Dealers can simply upload a picture of their GST Certificate or PAN, and the system uses AI Vision to extract and auto-fill the entire digital form, achieving "zero manual data entry" for the user.
*   **WhatsApp Bot Integration:** Dealers can check their application status or receive instant alerts via WhatsApp, recognizing that many non-technical users prefer WhatsApp over installing standalone portals.
*   **Geo-Tagging & Liveness Check:** The app captures background GPS coordinates during submission to verify the physical dealership location, and includes a quick "video selfie" step for fraud prevention (liveness detection).
*   **Automated Anomaly Detection:** The system flags applications submitted from identical IP addresses with different dealership names for manual review to prevent spam/fraud.

---

## 5. Non-Functional Requirements (Evaluation Criteria)

*   **Data Integrity:** Prevent fraudulent entries via real-time KYC API validation and OCR cross-verification.
*   **Process Efficiency:** Slash onboarding TAT from 7-14 days to < 48 hours. Zero manual data entry.
*   **User Experience (UX):** Guided mobile form allowing non-technical dealers to complete onboarding without help.
*   **Security & Compliance:** 
    *   TLS 1.3 for data in transit. 
    *   AES-256 for PII data at rest.
    *   Compliance with UIDAI and DPDP Act 2023.
*   **Workflow Logic:** Effectively handle rejections, resubmissions, and escalations.

---

## 5. System Architecture & Tech Stack
*   **Dealer App:** Expo / React Native (Mobile Interface)
*   **Verification Dashboard:** React Web App (Separate Internal Portal)
*   **Backend API:** Express.js / Node.js (Hosted on Vercel)
*   **Theme Styling:** Dark mode MVP with Supernova (`#FFCC00`), Mustard (`#FED94B`), and Sea Green (`#288840`) accents.
