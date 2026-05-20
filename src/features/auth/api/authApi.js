import { httpClient } from '../../../shared/api/httpClient';

export const authApi = {
  register: (email, password) =>
    httpClient.post('/auth/register', { email, password }),

  login: (email, password) =>
    httpClient.post('/auth/login', { email, password }),

  refresh: () => httpClient.post('/auth/refresh'),

  logout: () => httpClient.post('/auth/logout'),

  forgotPassword: (email) => httpClient.post('/auth/forgot-password', { email }),

  updatePassword: (token, newPassword) =>
    httpClient.post('/auth/update-password', { token, new_password: newPassword }),

  verifyEmail: (token) =>
    httpClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  getProfile: () => httpClient.get('/users/me'),

  updateProfile: (patch) => httpClient.patch('/users/me', patch),
};
