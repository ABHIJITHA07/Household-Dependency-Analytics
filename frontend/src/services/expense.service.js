import api from './api.js';

export const expenseService = {
  async getAll(householdId) {
    return api.get(`/households/${householdId}/expenses`);
  },

  async create(householdId, data) {
    return api.post(`/households/${householdId}/expenses`, data);
  },

  async update(householdId, expenseId, data) {
    return api.put(`/households/${householdId}/expenses/${expenseId}`, data);
  },

  async delete(householdId, expenseId) {
    return api.delete(`/households/${householdId}/expenses/${expenseId}`);
  }
};
