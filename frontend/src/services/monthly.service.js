import api from './api.js';

export const monthlyService = {
  async getAll(householdId) {
    return api.get(`/households/${householdId}/monthly-records`);
  },

  async create(householdId, data) {
    return api.post(`/households/${householdId}/monthly-records`, data);
  },

  async getById(householdId, recordId) {
    return api.get(`/households/${householdId}/monthly-records/${recordId}`);
  },

  async delete(householdId, recordId) {
    return api.delete(`/households/${householdId}/monthly-records/${recordId}`);
  }
};
