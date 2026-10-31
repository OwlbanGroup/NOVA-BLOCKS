import axios from 'axios';

// Create axios instance with base URL from backend
const axiosInstance = axios.create({
  baseURL: '/api', // Proxy to backend
  withCredentials: true, // Send cookies/credentials for CORS
});

// Request interceptor - add auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or state management
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token might be expired
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token using refresh token
      try {
        const refreshResponse = await axiosInstance.post('/auth/refresh-token');
        const newToken = refreshResponse.data.token;

        // Update authorization header with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        localStorage.setItem('authToken', newToken);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('authToken');
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle standardized error format from backend
    if (error.response && error.response.data) {
      const { success, error, details } = error.response.data;

      // You can dispatch a global error state here
      // e.g., store.dispatch(setError(error));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;