import { httpClient } from '../../../shared/api/httpClient';

export const authApi = {
  register: (email, password) =>
    httpClient.post('/auth/register', { email, password }),

  login: (email, password) =>
    httpClient.post('/auth/login', { email, password }),

  refresh: () => httpClient.post('/auth/refresh', undefined, { _retry: true }),

  logout: () => httpClient.post('/auth/logout'),

  forgotPassword: (email) => httpClient.post('/auth/forgot-password', { email }),

  updatePassword: (token, newPassword) =>
    httpClient.post('/auth/update-password', { token, new_password: newPassword }),

  verifyEmail: (token) =>
    httpClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  getProfile: () => httpClient.get('/users/me'),

  updateProfile: (patch) => httpClient.patch('/users/me', patch),

  // Ответ — обновлённый профиль с новым avatar_url.
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('file', file);
    return httpClient.post('/users/me/avatar', form);
  },

  deleteAvatar: () => httpClient.delete('/users/me/avatar'),

  // Картинка отдаётся только с токеном, поэтому <img src> не подходит — берём файл.
  getAvatar: (url) => httpClient.getBlob(url),

  // Выдаёт админу HttpOnly-куку для /admin/ и возвращает { url }. Не админу — 404.
  openAdminSession: () => httpClient.post('/auth/admin-session'),
};
