import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const taskApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.patch('/users/profile', data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};
