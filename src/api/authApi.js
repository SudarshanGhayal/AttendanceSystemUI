import apiClient, { unwrap } from '../hooks/clinet';

export const authApi = {
  login: (username, password) => unwrap(apiClient.post('/auth/login', { username, password })),

  setupStatus: () => unwrap(apiClient.get('/auth/setup-status')),

  setupAdmin: (payload) => unwrap(apiClient.post('/auth/setup-admin', payload)),

  register: (payload) => unwrap(apiClient.post('/auth/register', payload)),

  getUsers: () => unwrap(apiClient.get('/auth/users')),

  changePassword: (payload) => unwrap(apiClient.post('/auth/change-password', payload)),

  me: () => unwrap(apiClient.get('/auth/me')),
};