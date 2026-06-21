import apiClient, { unwrap } from '../hooks/clinet';

export const employeeApi = {
  getAll: (params) => unwrap(apiClient.get('/employees', { params })),

  getSummary: () => unwrap(apiClient.get('/employees/summary')),

  getById: (id) => unwrap(apiClient.get(`/employees/${id}`)),

  create: (payload) => unwrap(apiClient.post('/employees', payload)),

  update: (id, payload) => unwrap(apiClient.put(`/employees/${id}`, payload)),

  deactivate: (id) => unwrap(apiClient.post(`/employees/${id}/deactivate`)),

  activate: (id) => unwrap(apiClient.post(`/employees/${id}/activate`)),

  remove: (id) => unwrap(apiClient.delete(`/employees/${id}`)),
};