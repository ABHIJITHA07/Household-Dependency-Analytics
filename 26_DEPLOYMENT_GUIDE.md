# 26 — Production Deployment Guide

Guide for deploying the multi-service architecture to cloud platforms (Vercel, Render/Railway, Managed MySQL).

---

## 1. Cloud Architecture Blueprint

```
[ Vercel / Netlify ] ────────► [ Render / Railway Node API ] ──► [ Managed MySQL ]
  (Static React Frontend)        │ (Port 5000 REST Engine)        (Database 3306)
                                 ├─► [ Render Python Service ]
                                 │     (FastAPI ML Model)
                                 └─► [ Google Gemini API ]
```

---

## 2. Deployment Steps

### 2.1 Managed MySQL Database
1. Provision MySQL instance on Aiven, Railway, or AWS RDS.
2. Execute `database/schema.sql`.
3. Obtain connection string and update backend production environment variables.

### 2.2 Python ML Service Deployment (Render / Railway)
1. Push repository to GitHub.
2. Create new Web Service pointing to `ml-service/`.
3. Environment variables: `ML_SERVICE_API_KEY`, `PORT=8000`.
4. Build command: `pip install -r requirements.txt && python app/train.py`.
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

### 2.3 Node.js Backend Deployment (Render / Railway)
1. Create Web Service pointing to `backend/`.
2. Set Environment Variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `GEMINI_API_KEY`, `ML_SERVICE_URL`, `ML_SERVICE_API_KEY`, `CORS_ORIGIN`.
3. Build command: `npm install`.
4. Start command: `node src/server.js`.

### 2.4 React Frontend Deployment (Vercel / Netlify)
1. Connect GitHub repo to Vercel/Netlify pointing to `frontend/`.
2. Environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`.
3. Build command: `npm run build`. Output directory: `dist`.
