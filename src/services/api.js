import axios from 'axios';
// import { fetchEventSource } from '@microsoft/fetch-event-source';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ag_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);

// ─── Vehicles ─────────────────────────────────────────────────────────────
export const getVehicles = (params) => api.get('/api/vehicles', { params });
export const getVehicle = (id) => api.get(`/api/vehicles/${id}`);
export const aiSearch = (data) => api.post('/api/vehicles/ai-search', data);

export const streamAiSearch = (query, { onDelta, onDone, onError } = {}) => {
  const controller = new AbortController();
  const token = localStorage.getItem('ag_token');

  fetch(`${BASE}/api/vehicles/ai-search-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(query),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        onError?.(`Server error: ${response.status}`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (!part.trim()) continue;
          let eventType = 'message';
          let dataStr = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            else if (line.startsWith('data: ')) dataStr = line.slice(6);
          }
          if (eventType === 'delta') {
            try { onDelta?.(JSON.parse(dataStr).text); } catch {}
          } else if (eventType === 'done') {
            try { onDone?.(JSON.parse(dataStr).vehicle); } catch {}
          } else if (eventType === 'error') {
            try { onError?.(JSON.parse(dataStr).message); } catch {}
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError?.(err.message);
    });

  return () => controller.abort();
};
export const incrementSearchCount = (id) => api.patch(`/api/vehicles/${id}/search-count`);
export const getSuggestions = (q) => api.get('/api/vehicles/suggestions', { params: { q } });

// ─── Listings ─────────────────────────────────────────────────────────────
export const getListings = () => api.get('/api/listings');
export const createListing = (data) => api.post('/api/listings', data);
export const deleteListing = (id) => api.delete(`/api/listings/${id}`);

// ─── Bookmarks ────────────────────────────────────────────────────────────
export const getBookmarks = () => api.get('/api/bookmarks');
export const addBookmark = (vehicleId) => api.post(`/api/bookmarks/${vehicleId}`);
export const removeBookmark = (vehicleId) => api.delete(`/api/bookmarks/${vehicleId}`);

// ─── Compare ──────────────────────────────────────────────────────────────
export const compareVehicles = (ids) => api.get('/api/compare', { params: { ids: ids.join(',') } });

// ─── Used Market Search ───────────────────────────────────────────────────
export const findUsedListings = (vehicleId, location) => api.post('/api/used-market', { vehicleId, location });

// ─── Contact ──────────────────────────────────────────────────────────────
export const submitContact = (data) => api.post('/api/contact', data);

// ─── Upload ───────────────────────────────────────────────────────────────
export const uploadImages = (formData) =>
  api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminStats = () => api.get('/api/admin/stats');
export const adminUsers = () => api.get('/api/admin/users');
export const adminBanUser = (id) => api.patch(`/api/admin/users/${id}/ban`);
export const adminGetCache = () => api.get('/api/admin/cache');
export const adminDeleteCache = (id) => api.delete(`/api/admin/cache/${id}`);
export const adminGetVehicles = () => api.get('/api/admin/vehicles');
export const adminFeatureVehicle = (id) => api.patch(`/api/admin/vehicles/${id}/feature`);
export const adminDeleteVehicle = (id) => api.delete(`/api/admin/vehicles/${id}`);
export const adminPredictionLogs = () => api.get('/api/admin/prediction-logs');
export const adminSearchLogs = () => api.get('/api/admin/search-logs');
export const adminGetListings = () => api.get('/api/admin/listings');
export const adminDeleteListing = (id) => api.delete(`/api/admin/listings/${id}`);
export const adminGetContacts = () => api.get('/api/admin/contacts');
export const adminMarkContactRead = (id) => api.patch(`/api/admin/contacts/${id}/read`);
