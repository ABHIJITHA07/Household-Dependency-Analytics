# 24 — Environment Variables Specification

## 1. Node.js Backend Environment Configuration (`backend/.env`)

```env
# Server Config
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database Config
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=household_dependency

# Security Secrets (NEVER expose to frontend)
JWT_SECRET=super_secret_jwt_key_min_32_characters_long_for_security
JWT_EXPIRES_IN=7d

# Microservice & External AI Credentials (NEVER expose to frontend)
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_API_KEY=internal_ml_service_secret_api_key_2026
GEMINI_API_KEY=AIzaSy_your_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

---

## 2. Python FastAPI ML Service Configuration (`ml-service/.env`)

```env
PORT=8000
ML_SERVICE_API_KEY=internal_ml_service_secret_api_key_2026
MODEL_PATH=app/models/rf_model.joblib
```

---

## 3. React Frontend Environment Configuration (`frontend/.env`)

```env
# Node.js Public Backend Base URL
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Security Check:** Frontend MUST ONLY contain `VITE_API_BASE_URL`. Never add `VITE_GEMINI_API_KEY` or `VITE_JWT_SECRET`.
