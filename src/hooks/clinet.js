import axios from 'axios';

// Base URL for the ASP.NET Core Web API. Override at build time with
// VITE_API_BASE_URL if the backend runs on a different host/port.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7296/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT bearer token (if present) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('SG_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralize 401 handling: clear session and redirect to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('SG_token');
      localStorage.removeItem('SG_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Unwraps the backend's ApiResponse<T> envelope ({ success, message, data, errors })
 * and throws a normalized Error with a readable message on failure.
 */
export function unwrap(promise) {
  return promise
    .then((res) => res.data?.data ?? res.data)
    .catch((err) => {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        err.message ||
        'Something went wrong. Please try again.';
      throw new Error(apiMessage);
    });
}

/** Downloads a binary (Excel/PDF) response as a file. */
export async function downloadFile(url, params, filename) {
  const token = localStorage.getItem('SG_token');
  const response = await apiClient.get(url, {
    params,
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default apiClient;