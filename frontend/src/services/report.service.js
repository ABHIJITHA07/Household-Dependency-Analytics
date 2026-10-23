import api from './api.js';

export const reportService = {
  async create(householdId, data) {
    return api.post(`/households/${householdId}/reports`, data);
  },

  async getById(reportId) {
    return api.get(`/reports/${reportId}`);
  },

  async listByHousehold(householdId) {
    return api.get(`/households/${householdId}/reports`);
  },

  async downloadPDF(reportId) {
    return api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
  },

  async delete(reportId) {
    return api.delete(`/reports/${reportId}`);
  }
};
