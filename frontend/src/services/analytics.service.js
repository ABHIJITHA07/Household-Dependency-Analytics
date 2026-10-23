import api from './api.js';

export const analyticsService = {
  async getAnalytics(householdId) {
    return api.get(`/households/${householdId}/analytics`);
  }
};
