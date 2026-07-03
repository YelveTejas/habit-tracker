import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Session expired anywhere in the app -> back to login
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('hf_token');
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export const apiError = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong';

export default api;
