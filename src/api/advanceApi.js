import apiClient, { unwrap } from '../hooks/clinet';

export const advanceApi = {
  getAll: (params) => unwrap(apiClient.get('/advancepayment', { params })),

  getById: (id) => unwrap(apiClient.get(`/advancepayment/${id}`)),

  getPending: (employeeId) => unwrap(apiClient.get(`/advancepayment/pending/${employeeId}`)),

  give: (payload) => unwrap(apiClient.post('/advancepayment', payload)),

  recordRecovery: (id, recoveryAmount) =>
    unwrap(apiClient.post(`/advancepayment/${id}/recover`, { recoveryAmount })),

  remove: (id) => unwrap(apiClient.delete(`/advancepayment/${id}`)),
};