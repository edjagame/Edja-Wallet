import axios from 'axios';

// Provide a relative fallback URL so Nginx can proxy API requests in Docker.
const rawApiUrl = process.env.REACT_APP_API_URL || '/api';
let baseURL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

if (!baseURL.endsWith('/api') && baseURL !== '/api') {
  baseURL += '/api';
}

const instance = axios.create({
  baseURL,
});

// Attach the current JWT to every protected API request.
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Clear stale sessions when the server rejects the token.
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
