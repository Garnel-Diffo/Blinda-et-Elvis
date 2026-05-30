import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach admin token to protected requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && (config.url?.startsWith('/reservations') || config.url?.startsWith('/tickets'))) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API with auth header
export const adminApi = axios.create({ baseURL: '/api' });
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Public endpoints
export const submitRSVP = (data) => axios.post('/api/rsvp', data);
export const getCount = () => axios.get('/api/count');

// Admin endpoints
export const adminLogin = (password) =>
  axios.post('/api/admin/login', { password });
export const adminVerify = () =>
  adminApi.get('/admin/verify');

export const getReservations = (search = '') =>
  adminApi.get(`/reservations${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const deleteReservation = (id) =>
  adminApi.delete(`/reservations/${id}`);
export const exportExcel = () =>
  adminApi.get('/reservations/export/excel', { responseType: 'blob' });

export const uploadTemplate = (formData) =>
  adminApi.post('/tickets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getTicketConfig = () => adminApi.get('/tickets/config');
export const saveTicketConfig = (data) => adminApi.post('/tickets/config', data);
export const generateTicket = (id) =>
  adminApi.get(`/tickets/generate/${id}`, { responseType: 'blob' });
export const generateAllTickets = () =>
  adminApi.get('/tickets/generate-all', { responseType: 'blob' });

export default api;
