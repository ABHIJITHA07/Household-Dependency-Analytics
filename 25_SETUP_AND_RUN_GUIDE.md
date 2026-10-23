# 25 — Setup & Local Execution Guide

Step-by-step instructions to configure, run, and test the full-stack system locally.

---

## 1. Prerequisites Checklist

- **Node.js:** v20 LTS or higher
- **Python:** v3.11 or higher
- **MySQL:** v8.0 or higher (running on port 3306)
- **Git**

---

## 2. Step 1: Database Setup

1. Open terminal and log in to MySQL:
   ```bash
   mysql -u root -p
   ```
2. Execute the schema DDL script:
   ```sql
   SOURCE database/schema.sql;
   ```
3. (Optional) Load seed data:
   ```sql
   SOURCE database/seed.sql;
   ```

---

## 3. Step 2: Python ML Service Setup

1. Navigate to the `ml-service` directory:
   ```bash
   cd ml-service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and set `ML_SERVICE_API_KEY`.
5. Generate synthetic dataset and train the Random Forest model:
   ```bash
   python app/train.py
   ```
6. Start the FastAPI service:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *(Verify at `http://localhost:8000/docs`)*

---

## 4. Step 3: Node.js Backend Setup

1. Open a new terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure MySQL credentials and `GEMINI_API_KEY`.
4. Start the development server:
   ```bash
   npm run dev
   ```
   *(Backend running at `http://localhost:5000`)*

---

## 5. Step 4: React Frontend Setup

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` (`VITE_API_BASE_URL=http://localhost:5000/api`).
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
5. Open browser at `http://localhost:5173`.
