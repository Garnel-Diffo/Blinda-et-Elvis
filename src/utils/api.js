import axios from 'axios';

export const adminApi = axios.create({ baseURL: '/api' });
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper: extract a safe string from any error
export function extractError(err, fallback = 'Une erreur s\'est produite') {
  const raw = err?.response?.data?.error;
  if (typeof raw === 'string') return raw;
  if (raw?.message) return String(raw.message);
  if (err?.message) return String(err.message);
  return fallback;
}

// Public
export const submitRSVP = (data) => axios.post('/api/rsvp', data);
export const getCount = () => axios.get('/api/count');

// Admin auth
export const adminLogin = (password) =>
  axios.post('/api/admin/login', { password });
export const adminVerify = () =>
  adminApi.get('/admin/verify');

// Reservations (admin)
export const getReservations = (search = '') =>
  adminApi.get(`/reservations${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const deleteReservation = (id) =>
  adminApi.delete(`/reservations/${id}`);
export const exportExcel = () =>
  adminApi.get('/reservations/export/excel', { responseType: 'blob' });

// Tickets (admin) — upload via base64 JSON
export const uploadTemplate = (data) =>
  adminApi.post('/tickets/upload', data); // { base64, mime }

export const getTicketTemplate = () =>
  adminApi.get('/tickets/template', { responseType: 'blob' });
export const getTicketStatus = () => adminApi.get('/tickets/status');

export const getTicketConfig = () => adminApi.get('/tickets/config');
export const saveTicketConfig = (data) => adminApi.post('/tickets/config', data);
export const generateTicket = (id) =>
  adminApi.get(`/tickets/generate/${id}`, { responseType: 'blob' });
export const generateAllTickets = () =>
  adminApi.get('/tickets/generate-all', { responseType: 'blob' });
