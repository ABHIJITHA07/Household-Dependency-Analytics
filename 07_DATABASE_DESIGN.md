# 07 — Database Design

Engine: **MySQL 8.0.16+**, InnoDB, `utf8mb4`, `utf8mb4_unicode_ci`. Naming: `snake_case`. All ids `BIGINT UNSIGNED AUTO_INCREMENT`. Timestamps UTC. Money `DECIMAL(12,2)`.

**Derived-value policy:** current analytics (dependency ratio, savings, rates, totals) are **never stored** for the live household — they are recomputed on every request. Derived values are stored **only** in `monthly_records` (point-in-time snapshots that must not change if formulas or current data change later) and as inputs/outputs of `predictions`/`ai_insights` (for audit and staleness checks).

## 1. `users`
| Column | Type | Null | Key | Default | Constraints / Purpose |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | NO | PK | AUTO_INCREMENT | Identity |
| name | VARCHAR(100) | NO | | | 2–100 chars (app-enforced) |
| email | VARCHAR(255) | NO | UNIQUE | | Stored lowercase; login id |
| password_hash | VARCHAR(255) | NO | | | bcrypt hash |
| created_at | DATETIME | NO | | CURRENT_TIMESTAMP | |
| updated_at | DATETIME | NO | | CURRENT_TIMESTAMP ON UPDATE | |

## 2. `households`
Holds the **current** household state including demographics (replaces a separate demographics table).
| Column | Type | Null | Key | Default | Constraints / Purpose |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | NO | PK | AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | NO | FK→users.id ON DELETE CASCADE | | Owner |
| name | VARCHAR(100) | NO | | | 2–100 chars |
| location | VARCHAR(120) | YES | | NULL | Optional free text, never sent to Gemini |
| total_members | SMALLINT UNSIGNED | NO | | | CHECK 1–50 |
| earning_members | SMALLINT UNSIGNED | NO | | 0 | CHECK ≤ total_members |
| dependent_members | SMALLINT UNSIGNED | NO | | 0 | CHECK ≤ total_members |
| children_count | SMALLINT UNSIGNED | NO | | 0 | CHECK ≤ total_members |
| elderly_count | SMALLINT UNSIGNED | NO | | 0 | CHECK ≤ total_members |
| monthly_income | DECIMAL(12,2) | NO | | 0.00 | CHECK ≥ 0 |
| created_at / updated_at | DATETIME | NO | | as above | |

Table CHECKs: `earning_members + dependent_members <= total_members`; `children_count + elderly_count <= total_members`.

## 3. `expenses`
| Column | Type | Null | Key | Default | Constraints / Purpose |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | NO | PK | AUTO_INCREMENT | |
| household_id | BIGINT UNSIGNED | NO | FK→households.id ON DELETE CASCADE | | |
| category | ENUM(11 values) | NO | | | `HOUSING, FOOD, EDUCATION, HEALTHCARE, TRANSPORTATION, UTILITIES, INSURANCE, DEBT, ENTERTAINMENT, SHOPPING, OTHER` |
| amount | DECIMAL(12,2) | NO | | | CHECK ≥ 0 (monthly amount) |
| is_essential | TINYINT(1) | NO | | 1 | 1 essential, 0 non-essential |
| description | VARCHAR(255) | YES | | NULL | Optional; never sent to Gemini |
| created_at / updated_at | DATETIME | NO | | | |

## 4. `monthly_records` (optional snapshots)
| Column | Type | Null | Key | Default | Purpose |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | NO | PK | AUTO_INCREMENT | |
| household_id | BIGINT UNSIGNED | NO | FK→households.id CASCADE | | |
| record_month | TINYINT UNSIGNED | NO | | | CHECK 1–12 |
| record_year | SMALLINT UNSIGNED | NO | | | CHECK 2000–2100 |
| total_members, earning_members, dependent_members, children_count, elderly_count | SMALLINT UNSIGNED | NO | | | Demographic snapshot |
| monthly_income | DECIMAL(12,2) | NO | | | Snapshot |
| total_expenses | DECIMAL(12,2) | NO | | | Snapshot (backend sum) |
| essential_expenses | DECIMAL(12,2) | NO | | | Snapshot |
| non_essential_expenses | DECIMAL(12,2) | NO | | | Snapshot |
| monthly_savings | DECIMAL(12,2) | NO | | | May be negative |
| savings_rate | DECIMAL(8,2) | YES | | NULL | NULL when income = 0 |
| expense_ratio | DECIMAL(8,2) | YES | | NULL | NULL when income = 0 |
| dependency_ratio | DECIMAL(8,2) | YES | | NULL | NULL when earning = 0 |
| dependency_level | ENUM('LOW','MEDIUM','HIGH') | NO | | | Snapshot |
| financial_condition | ENUM('HEALTHY','MODERATE','TIGHT','DEFICIT','NO_INCOME') | NO | | | Snapshot |
| expense_breakdown_json | JSON | NO | | | `[ {category, total, essentialTotal, nonEssentialTotal} ]` |
| predicted_risk_level | ENUM('LOW','MEDIUM','HIGH') | YES | | NULL | NULL if no prediction available |
| prediction_id | BIGINT UNSIGNED | YES | FK→predictions.id ON DELETE SET NULL | NULL | Linked prediction |
| insight_id | BIGINT UNSIGNED | YES | FK→ai_insights.id ON DELETE SET NULL | NULL | Linked insight |
| notes | VARCHAR(500) | YES | | NULL | User note |
| created_at / updated_at | DATETIME | NO | | | |

Constraint: `UNIQUE (household_id, record_year, record_month)`.
Reason for stored derived values: historical integrity (see policy above).

## 5. `predictions`
| Column | Type | Null | Key | Default | Purpose |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | NO | PK | AUTO_INCREMENT | |
| household_id | BIGINT UNSIGNED | NO | FK→households.id CASCADE | | |
| input_hash | CHAR(64) | NO | | | SHA-256 of the 10 ordered features (see `11`) |
| features_json | JSON | NO | | | Exact features sent to ML |
| predicted_risk_level | ENUM('LOW','MEDIUM','HIGH') | NO | | | |
| probabilities_json | JSON | NO | | | `{LOW, MEDIUM, HIGH}` vote shares |
| top_factors_json | JSON | NO | | | Indicative contributing factors |
| model_version | VARCHAR(50) | NO | | | e.g. `rf-v1.0.0` |
| created_at | DATETIME | NO | | CURRENT_TIMESTAMP | |

## 6. `ai_insights`
| Column | Type | Null | Key | Default | Purpose |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | NO | PK | AUTO_INCREMENT | |
| household_id | BIGINT UNSIGNED | NO | FK→households.id CASCADE | | |
| prediction_id | BIGINT UNSIGNED | YES | FK→predictions.id SET NULL | NULL | Prediction used as input |
| input_hash | CHAR(64) | NO | | | SHA-256 of analytics input (`analyticsInputHash`) |
| content_json | JSON | NO | | | `{sections:{…}, disclaimer}` |
| model_name | VARCHAR(100) | NO | | | Gemini model used |
| created_at | DATETIME | NO | | CURRENT_TIMESTAMP | |

## 7. `reports`
| Column | Type | Null | Key | Default | Purpose |
|---|---|---|---|---|---|
| id | BIGINT UNSIGNED | NO | PK | AUTO_INCREMENT | |
| household_id | BIGINT UNSIGNED | NO | FK→households.id CASCADE | | |
| report_type | ENUM('CURRENT','MONTHLY') | NO | | | |
| monthly_record_id | BIGINT UNSIGNED | YES | FK→monthly_records.id SET NULL | NULL | Required when MONTHLY |
| title | VARCHAR(150) | NO | | | e.g. "Current Household Report — 06 Oct 2026" |
| period_label | VARCHAR(50) | YES | | NULL | e.g. "March 2026"; NULL for CURRENT |
| snapshot_json | JSON | NO | | | Complete `reportData` at generation time |
| created_at | DATETIME | NO | | CURRENT_TIMESTAMP | |

PDF files are **not** stored on disk (ephemeral hosting); they are rendered from `snapshot_json` on each download.

## 8. Indexes
`users(email)` unique · `households(user_id)` · `expenses(household_id)` · `expenses(household_id, category)` · `monthly_records(household_id, record_year, record_month)` unique · `predictions(household_id, created_at)` · `predictions(household_id, input_hash)` · `ai_insights(household_id, created_at)` · `ai_insights(household_id, input_hash)` · `reports(household_id, created_at)`.

## 9. Cascade rules
| Parent delete | Effect |
|---|---|
| user | its households (and everything below) deleted |
| household | expenses, monthly_records, predictions, ai_insights, reports deleted |
| prediction | `monthly_records.prediction_id`, `ai_insights.prediction_id` set NULL |
| ai_insight | `monthly_records.insight_id` set NULL |
| monthly_record | `reports.monthly_record_id` set NULL (report keeps `snapshot_json`) |

## 10. Full DDL (`database/schema.sql`)
```sql
CREATE DATABASE IF NOT EXISTS household_dependency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE household_dependency;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE households (
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

CREATE TABLE expenses (
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

CREATE TABLE predictions (
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

CREATE TABLE ai_insights (
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

CREATE TABLE monthly_records (
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

CREATE TABLE reports (
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
```
Note: `monthly_records` references `predictions` and `ai_insights`, so create those first (order above is correct).

## 11. Seed data
`database/seed.sql` is **optional** and must contain only a demo user placeholder with a documented bcrypt hash generated by a script — never a real password, never loaded in production.
