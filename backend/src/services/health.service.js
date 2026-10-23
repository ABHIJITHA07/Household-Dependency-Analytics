import { HealthRepository } from '../repositories/health.repository.js';
import env from '../config/env.js';

export class HealthService {
  /**
   * Evaluates system health and database connectivity readiness.
   * @returns {Promise<object>}
   */
  static async getSystemHealth() {
    const isDbAlive = await HealthRepository.checkDatabaseHealth();

    return {
      status: isDbAlive ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
      services: {
        backend: 'UP',
        database: isDbAlive ? 'UP' : 'DOWN',
      }
    };
  }
}
