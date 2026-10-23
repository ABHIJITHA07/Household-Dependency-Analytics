import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env.js';
import routes from './routes/index.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));

// Body Parsers with JSON Size Limits (10kb max)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global Rate Limiting
app.use('/api', globalLimiter);

// API Routes
app.use('/api', routes);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    message: 'Household Dependency Analytics & Prediction System API',
    status: 'ACTIVE',
    docs: '/api/health'
  });
});

// 404 Not Found Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
