import api from './api.js';

export const insightService = {
  async getInsights(householdId, options = {}) {
    return api.post(`/households/${householdId}/insights`, options);
  },

  async chat(message, householdId = null) {
    return api.post('/ai/chat', { message, householdId });
  }
};
