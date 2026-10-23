import api from './api.js';

export const predictionService = {
  async getPrediction(householdId) {
    return api.get(`/households/${householdId}/prediction`);
  }
};
