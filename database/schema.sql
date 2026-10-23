-- Household Dependency Analytics & Prediction System
-- Database Schema DDL Specification

CREATE DATABASE IF NOT EXISTS household_dependency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE household_dependency;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- 2. Households Table
CREATE TABLE IF NOT EXISTS households (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(120) NULL,
  total_members SMALLINT UNSIGNED NOT NULL,
  earning_members SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  dependent_members SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  children_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  elderly_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  monthly_income DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_households_user (user_id),
  CONSTRAINT fk_households_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_hh_total CHECK (total_members BETWEEN 1 AND 50),
  CONSTRAINT chk_hh_earning CHECK (earning_members <= total_members),
  CONSTRAINT chk_hh_dependent CHECK (dependent_members <= total_members),
  CONSTRAINT chk_hh_children CHECK (children_count <= total_members),
  CONSTRAINT chk_hh_elderly CHECK (elderly_count <= total_members),
  CONSTRAINT chk_hh_earn_dep CHECK (earning_members + dependent_members <= total_members),
  CONSTRAINT chk_hh_child_eld CHECK (children_count + elderly_count <= total_members),
  CONSTRAINT chk_hh_income CHECK (monthly_income >= 0)
) ENGINE=InnoDB;

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  household_id BIGINT UNSIGNED NOT NULL,
  category ENUM('HOUSING','FOOD','EDUCATION','HEALTHCARE','TRANSPORTATION','UTILITIES','INSURANCE','DEBT','ENTERTAINMENT','SHOPPING','OTHER') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  is_essential TINYINT(1) NOT NULL DEFAULT 1,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_expenses_household (household_id),
  KEY idx_expenses_household_category (household_id, category),
  CONSTRAINT fk_expenses_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT chk_expense_amount CHECK (amount >= 0)
) ENGINE=InnoDB;

-- 4. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  household_id BIGINT UNSIGNED NOT NULL,
  input_hash CHAR(64) NOT NULL,
  features_json JSON NOT NULL,
  predicted_risk_level ENUM('LOW','MEDIUM','HIGH') NOT NULL,
  probabilities_json JSON NOT NULL,
  top_factors_json JSON NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pred_household_created (household_id, created_at),
  KEY idx_pred_household_hash (household_id, input_hash),
  CONSTRAINT fk_pred_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  household_id BIGINT UNSIGNED NOT NULL,
  prediction_id BIGINT UNSIGNED NULL,
  input_hash CHAR(64) NOT NULL,
  content_json JSON NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ins_household_created (household_id, created_at),
  KEY idx_ins_household_hash (household_id, input_hash),
  CONSTRAINT fk_ins_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT fk_ins_prediction FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Monthly Records Table (Snapshots)
CREATE TABLE IF NOT EXISTS monthly_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  household_id BIGINT UNSIGNED NOT NULL,
  record_month TINYINT UNSIGNED NOT NULL,
  record_year SMALLINT UNSIGNED NOT NULL,
  total_members SMALLINT UNSIGNED NOT NULL,
  earning_members SMALLINT UNSIGNED NOT NULL,
  dependent_members SMALLINT UNSIGNED NOT NULL,
  children_count SMALLINT UNSIGNED NOT NULL,
  elderly_count SMALLINT UNSIGNED NOT NULL,
  monthly_income DECIMAL(12,2) NOT NULL,
  total_expenses DECIMAL(12,2) NOT NULL,
  essential_expenses DECIMAL(12,2) NOT NULL,
  non_essential_expenses DECIMAL(12,2) NOT NULL,
  monthly_savings DECIMAL(12,2) NOT NULL,
  savings_rate DECIMAL(8,2) NULL,
  expense_ratio DECIMAL(8,2) NULL,
  dependency_ratio DECIMAL(8,2) NULL,
  dependency_level ENUM('LOW','MEDIUM','HIGH') NOT NULL,
  financial_condition ENUM('HEALTHY','MODERATE','TIGHT','DEFICIT','NO_INCOME') NOT NULL,
  expense_breakdown_json JSON NOT NULL,
  predicted_risk_level ENUM('LOW','MEDIUM','HIGH') NULL,
  prediction_id BIGINT UNSIGNED NULL,
  insight_id BIGINT UNSIGNED NULL,
  notes VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_monthly_household_period (household_id, record_year, record_month),
  CONSTRAINT fk_monthly_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT fk_monthly_prediction FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE SET NULL,
  CONSTRAINT fk_monthly_insight FOREIGN KEY (insight_id) REFERENCES ai_insights(id) ON DELETE SET NULL,
  CONSTRAINT chk_monthly_month CHECK (record_month BETWEEN 1 AND 12),
  CONSTRAINT chk_monthly_year CHECK (record_year BETWEEN 2000 AND 2100)
) ENGINE=InnoDB;

-- 7. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  household_id BIGINT UNSIGNED NOT NULL,
  report_type ENUM('CURRENT','MONTHLY') NOT NULL,
  monthly_record_id BIGINT UNSIGNED NULL,
  title VARCHAR(150) NOT NULL,
  period_label VARCHAR(50) NULL,
  snapshot_json JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_household_created (household_id, created_at),
  CONSTRAINT fk_reports_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_monthly FOREIGN KEY (monthly_record_id) REFERENCES monthly_records(id) ON DELETE SET NULL
) ENGINE=InnoDB;
