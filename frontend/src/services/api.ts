import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach JWT access token and guest ID to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('goodeggs_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let guestId = localStorage.getItem('goodeggs_guest_id');
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 12)}`;
      localStorage.setItem('goodeggs_guest_id', guestId);
    }
    config.headers['x-guest-id'] = guestId;

    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('goodeggs_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;

          localStorage.setItem('goodeggs_access_token', accessToken);
          localStorage.setItem('goodeggs_refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          // Token refresh failed - clear tokens
          localStorage.removeItem('goodeggs_access_token');
          localStorage.removeItem('goodeggs_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

