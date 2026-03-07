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
*   **Automated KYC & Data Verification:** Real-time API validation (PAN, GSTIN, Aadhaar OTP, Bank Penny Drop, Passport) powered by **Sandbox.co.in**.
*   **Cross-Functional Approval Workflow:** Automated routing through Sales → Finance & KYC → Legal → Credit Control → IT.
*   **Custom Admin Panel & DB:** Verified data is stored securely in a custom PostgreSQL database managed via the admin panel.
*   **Communication & Visibility Engine:** Automated SMS/Email notifications and a real-time "Application Tracker".

---

## 2. Overall System Description

### 2.1 Product Perspective
OBL SwiftOnboard replaces the manual paper-based process. It operates as a hub connecting the Dealer-facing mobile app (React Native), Internal Admin dashboard (React Web App), Third-party KYC Verification APIs, PostgreSQL Database, and Notification gateways (MSG91/SendGrid).

### 2.2 Objective to provide to Customers & Internal Teams
1.  **Customer Portal/Mobile App:** Secure login to upload documents and track status.
3.  **Centralized Verification Dashboard (Simple React App):** A lightweight, fast internal React web application for administrative users to simply view application details and list incoming requests, focusing on speed rather than complex security overhead.
4.  **Automated Escalations:** Alerts for TAT breaches.
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
*   **FR-KYC-01/02:** Integrate PAN and GSTIN search APIs via **Sandbox.co.in**.
*   **FR-KYC-03:** Aadhaar verification via **Sandbox.co.in OKYC OTP**. Aadhaar numbers must be masked (XXXX XXXX XXXX).
*   **FR-KYC-04:** Bank account verification via Penny Drop method (**Sandbox.co.in Bank Verify**).
*   **FR-KYC-05:** Identity verification via Passport fetch (**Sandbox.co.in KYC Passport**).

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

### 3.7 Backend API Requirements (Express/Node.js)
*   **FR-API-01:** Provide authenticated RESTful endpoints for mobile and web frontends.
*   **FR-API-02:** Implement input validation for all incoming dealer data using standard middleware.
*   **FR-API-03:** Manage connection pooling for PostgreSQL database to handle concurrent application submissions.
*   **FR-API-04:** Log all departmental approval transitions to an audit table in the database.

### 3.8 Admin Web Portal Requirements (ReactJS)
*   **FR-WEB-01:** Lightweight single-page application (SPA) focused on "List and View" functionality for rapid institutional processing.
*   **FR-WEB-02:** Departmental Queues: Clear visibility of pending applications for Sales, Finance, Legal, etc.
*   **FR-WEB-03:** Document Review: Side-by-side view of uploaded documents and extracted OCR data for instant verification.
*   **FR-WEB-04:** Simple Approval Interface: Dedicated Approve/Reject/RFI actions for each workflow stage.

---

## 4. "Out of the Box" (Innovative Hackathon Features)
*   **AI-Powered OCR Extraction:** Intelligent data extraction from GST/PAN docs to enable zero-manual-entry onboarding.
*   **WhatsApp Sync:** Conversational application tracking and document requests via WhatsApp.
*   **Geo-Security & Liveness:** Live GPS tagging and video selfies during submission for fraud prevention.

---

## 5. System Architecture & Tech Stack
*   **Mobile App:** React Native / Expo SDK 54 (Dealer application).
*   **Backend Hub:** Node.js / Express.js (REST API & PostgreSQL persistence).
*   **Admin Dashboard:** React.js (Focused "Inbox" for internal approvals).
*   **Cloud Hosting:** Vercel (API & Web) for seamless scaling.

---

## 6. Evaluation Criteria
*   **Onboarding TAT:** Reduction from 7-14 days to < 48 hours.
*   **Data Integrity:** Multi-layered verification (API + OCR + Manual Review).
*   **UX Excellence:** Mobile-first, guided friction-less experience for dealers.
*   **Scalability:** Decoupled architecture allowing independent scaling of apps and APIs.
