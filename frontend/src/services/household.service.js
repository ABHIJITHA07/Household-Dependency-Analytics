import api from './api.js';

export const householdService = {
  async getAll() {
    return api.get('/households');
  },

  async getById(id) {
    return api.get(`/households/${id}`);
  },

  async create(data) {
    return api.post('/households', data);
  },

  async update(id, data) {
    return api.put(`/households/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/households/${id}`);
  }
};
