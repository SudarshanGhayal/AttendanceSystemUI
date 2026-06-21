import apiClient, { unwrap } from '../hooks/clinet';

export const attendanceApi = {
  mark: (payload) => unwrap(apiClient.post('/attendance/mark', payload)),

  markBulk: (payload) => unwrap(apiClient.post('/attendance/mark-bulk', payload)),

  getAll: (params) => unwrap(apiClient.get('/attendance', { params })),

  getMonthlyGrid: (month, year) =>
    unwrap(apiClient.get('/attendance/monthly-grid', { params: { month, year } })),

  getEmployeeSummary: (employeeId, month, year) =>
    unwrap(apiClient.get('/attendance/summary', { params: { employeeId, month, year } })),

  remove: (id) => unwrap(apiClient.delete(`/attendance/${id}`)),
};