import apiClient, { unwrap } from '.././hooks/clinet';

export const salaryApi = {
  generate: (payload) => unwrap(apiClient.post('/salary/generate', payload)),

  getAll: (params) => unwrap(apiClient.get('/salary', { params })),

  getById: (id) => unwrap(apiClient.get(`/salary/${id}`)),

  getPayslip: (id) => unwrap(apiClient.get(`/salary/${id}/payslip`)),

  updateStatus: (id, status) => unwrap(apiClient.put(`/salary/${id}/status`, { status })),

  remove: (id) => unwrap(apiClient.delete(`/salary/${id}`)),
};