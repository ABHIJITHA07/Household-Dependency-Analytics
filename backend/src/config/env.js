import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = ['PORT', 'JWT_SECRET', 'ML_SERVICE_API_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`[WARNING] Missing environment variable: ${envVar}. Using fallback defaults if available.`);
  }
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'household_dependency',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_fallback_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    apiKey: process.env.ML_SERVICE_API_KEY || 'internal_ml_service_secret_api_key_2026',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
};

export default env;
