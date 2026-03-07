-- OBL SwiftOnboard PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mobile VARCHAR(20),
  role VARCHAR(20) DEFAULT 'dealer',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  application_id VARCHAR(50) PRIMARY KEY,
  dealer_id VARCHAR(50) REFERENCES users(user_id),
  dealer_name VARCHAR(100),
  stage VARCHAR(30) DEFAULT 'DRAFT',
  current_dept VARCHAR(30),
  step1_business JSONB,
  step2_kyc JSONB,
  step3_bank JSONB,
  step4_docs JSONB,
  step5_terms JSONB,
  kyc_results JSONB DEFAULT '{}',
  workflow_history JSONB DEFAULT '[]',
  last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rejection_reason TEXT,
  credit_limit NUMERIC
);

CREATE TABLE IF NOT EXISTS kyc_logs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  reference_id VARCHAR(100),
  application_id VARCHAR(50),
  result VARCHAR(20),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  type VARCHAR(50),
  event VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
