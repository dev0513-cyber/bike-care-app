import axios from 'axios';

// API Configuration
// Use relative path to proxy through nginx
const API_BASE_URL = '/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add base URL logging for debugging
console.log('API Base URL configured as:', API_BASE_URL);

// Add request interceptor to handle authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    console.log('API Request:', config.method?.toUpperCase(), config.url, {
      headers: config.headers,
      data: config.data
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('authToken');
      // Don't redirect if we're already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Check authentication status
  checkStatus: () => api.get('/auth/status/'),
  
  // User registration
  signup: (userData) => api.post('/auth/signup/', userData),
  
  // User login
  login: (credentials) => api.post('/auth/login/', credentials),
  
  // User logout
  logout: () => api.post('/auth/logout/'),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile/'),
};

// Service API calls
export const serviceAPI = {
  // Book bike service
  bookService: (serviceData) => api.post('/service/book/', serviceData),
  
  // Get user's bike services
  getBookedServices: () => api.get('/service/book/'),
  
  // Schedule doorstep service
  scheduleDoorstepService: (serviceData) => api.post('/service/doorstep/', serviceData),
  
  // Get user's doorstep services
  getDoorstepServices: () => api.get('/service/doorstep/'),
  
  // Get service history
  getServiceHistory: () => api.get('/service/history/'),
  
  // Get price estimate
  getPriceEstimate: (estimateData) => api.post('/service/estimate/', estimateData),
  
  // Get resell value estimate
  getResellValue: (resellData) => api.post('/service/resell/', resellData),
};

// Vehicle API calls
export const vehicleAPI = {
  // Get user's vehicles
  getVehicles: () => api.get('/vehicles/'),

  // Create new vehicle
  createVehicle: (vehicleData) => api.post('/vehicles/', vehicleData),

  // Get specific vehicle
  getVehicle: (vehicleId) => api.get(`/vehicles/${vehicleId}/`),

  // Update vehicle
  updateVehicle: (vehicleId, vehicleData) => api.put(`/vehicles/${vehicleId}/`, vehicleData),

  // Delete vehicle
  deleteVehicle: (vehicleId) => api.delete(`/vehicles/${vehicleId}/`),

  // Set vehicle as primary
  setPrimaryVehicle: (vehicleId) => api.post(`/vehicles/${vehicleId}/set-primary/`),
};

// Contact API calls
export const contactAPI = {
  // Submit contact form
  submitContact: (contactData) => api.post('/contact/', contactData),
};

// Admin API calls
export const adminAPI = {
  // Admin authentication
  login: (credentials) => api.post('/admin/login/', credentials),
  checkStatus: () => api.get('/admin/status/'),

  // Dashboard
  getDashboard: () => api.get('/admin/dashboard/'),

  // User management
  getUsers: () => api.get('/admin/users/'),
  getUser: (userId) => api.get(`/admin/users/${userId}/`),
  createUser: (userData) => api.post('/admin/users/', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}/`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}/`),

  // Service management
  getServices: () => api.get('/admin/services/'),
  getBikeService: (serviceId) => api.get(`/admin/services/bike/${serviceId}/`),
  updateBikeService: (serviceId, serviceData) => api.put(`/admin/services/bike/${serviceId}/`, serviceData),
  deleteBikeService: (serviceId) => api.delete(`/admin/services/bike/${serviceId}/`),
  getDoorstepService: (serviceId) => api.get(`/admin/services/doorstep/${serviceId}/`),
  updateDoorstepService: (serviceId, serviceData) => api.put(`/admin/services/doorstep/${serviceId}/`, serviceData),
  deleteDoorstepService: (serviceId) => api.delete(`/admin/services/doorstep/${serviceId}/`),

  // Contact management
  getContacts: () => api.get('/admin/contacts/'),
  getContact: (contactId) => api.get(`/admin/contacts/${contactId}/`),
  updateContact: (contactId, contactData) => api.put(`/admin/contacts/${contactId}/`, contactData),
  deleteContact: (contactId) => api.delete(`/admin/contacts/${contactId}/`),
};

export const apiUtils = {
  handleError: (error) => {
    if (error.response) {
      return error.response.data;
    } else if (error.request) {
      return { message: 'Network error. Please check your connection.' };
    } else {
      return { message: 'An unexpected error occurred.' };
    }
  },
  
  formatErrorMessage: (error) => {
    const errorData = apiUtils.handleError(error);

    if (typeof errorData === 'string') {
      return errorData;
    }

    if (errorData.message) {
      return errorData.message;
    }

    if (errorData.errors) {
      const errors = errorData.errors;
      if (typeof errors === 'object') {
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        return firstError || 'Validation error occurred';
      }
    }

    if (typeof errorData === 'object') {
      const firstError = Object.values(errorData)[0];
      if (Array.isArray(firstError)) {
        return firstError[0];
      }
      return firstError || 'An error occurred';
    }

    return 'An unexpected error occurred';
  }
};

export default api;
