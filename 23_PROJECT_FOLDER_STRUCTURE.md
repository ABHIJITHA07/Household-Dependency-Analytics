# 23 — Project Folder Structure Specification

Complete directory layout and file organization map for the project repository.

```
f:\FSD MINI PROJECT\
├── files/                           # System Specifications (00–29 + README.md)
│   ├── 00_PROJECT_MASTER_SPEC.md
│   ├── 01_PROJECT_OVERVIEW.md
│   ├── ...
│   ├── 29_VIVA_TECHNICAL_EXPLANATION.md
│   └── README.md
├── database/                        # Database DDL & Data Scripts
│   ├── schema.sql                   # MySQL table definitions, FKs, constraints
│   └── seed.sql                     # Seed data script for demo testing
├── backend/                         # Node.js + Express REST API Backend
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/
│       │   ├── db.js                # mysql2/promise connection pool
│       │   ├── env.js               # Environment variables check & load
│       │   └── constants.js         # System enums & status constants
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── household.controller.js
│       │   ├── expense.controller.js
│       │   ├── analytics.controller.js
│       │   ├── prediction.controller.js
│       │   ├── insight.controller.js
│       │   ├── monthly.controller.js
│       │   └── report.controller.js
│       ├── services/
│       │   ├── analytics.engine.js  # Pure deterministic calculation functions
│       │   ├── ml.service.js        # Axios client for FastAPI prediction service
│       │   ├── gemini.service.js    # @google/genai SDK wrapper & payload builder
│       │   └── pdf.service.js       # PDFKit server-side report compiler
│       ├── repositories/
│       │   ├── user.repository.js
│       │   ├── household.repository.js
│       │   ├── expense.repository.js
│       │   ├── prediction.repository.js
│       │   ├── insight.repository.js
│       │   ├── monthly.repository.js
│       │   └── report.repository.js
│       ├── middleware/
│       │   ├── auth.middleware.js   # JWT verification & req.user attachment
│       │   ├── validate.middleware.js # Zod schema validation middleware
│       │   ├── error.middleware.js  # Centralized error formatting
│       │   └── rateLimit.middleware.js # Rate limiting configurations
│       ├── validators/
│       │   ├── auth.validator.js
│       │   ├── household.validator.js
│       │   └── expense.validator.js
│       ├── utils/
│       │   ├── money.js             # Financial rounding & formatting utilities
│       │   ├── hash.js              # Canonical SHA-256 hash calculator
│       │   └── logger.js            # Structured console logger
│       ├── app.js                   # Express app setup & middleware wiring
│       └── server.js                # Server entry point (app.listen)
├── ml-service/                      # Python FastAPI Machine Learning Microservice
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                  # FastAPI app & route handlers (/health, /predict)
│       ├── train.py                 # Synthetic dataset generator & RF trainer
│       ├── data/
│       │   └── synthetic_households.csv
│       ├── models/
│       │   └── rf_model.joblib      # Trained Random Forest model artifact
│       └── schemas/
│           └── predict.py           # Pydantic schemas for request/response
└── frontend/                        # React 18 + Vite Web Application
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── assets/                  # Icons, graphics, fallback images
        ├── styles/
        │   ├── theme.css            # CSS custom properties (Biscoff palette)
        │   └── index.css            # Base reset & typography
        ├── services/
        │   ├── api.js               # Base Axios instance with interceptors
        │   ├── auth.service.js
        │   ├── household.service.js
        │   ├── expense.service.js
        │   ├── analytics.service.js
        │   ├── prediction.service.js
        │   ├── insight.service.js
        │   ├── monthly.service.js
        │   └── report.service.js
        ├── context/
        │   ├── AuthContext.jsx      # Authentication & token state provider
        │   └── HouseholdContext.jsx # Active household selection state
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── MetricCard.jsx
        │   ├── StatusBadge.jsx
        │   ├── ExpenseTable.jsx
        │   ├── Charts.jsx           # Chart.js wrappers
        │   ├── ConfirmModal.jsx
        │   ├── AlertBanner.jsx
        │   └── SkeletonLoader.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── HouseholdListPage.jsx
        │   ├── HouseholdFormPage.jsx
        │   ├── ExpenseManagerPage.jsx
        │   ├── AnalyticsPage.jsx
        │   ├── PredictionPage.jsx
        │   ├── InsightsPage.jsx
        │   ├── HistoryPage.jsx
        │   ├── ReportsPage.jsx
        │   ├── ReportPreviewPage.jsx
        │   └── SettingsPage.jsx
        ├── App.jsx                  # React Router routes setup
        └── main.jsx                 # Entry point
```
