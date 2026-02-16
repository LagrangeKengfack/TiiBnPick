import axios from 'axios';

const axiosInstance = axios.create();

// Request interceptor to add the JWT token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                // Use .set() for better compatibility with newer axios versions
                config.headers.set('Authorization', `Bearer ${token.trim()}`);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle authentication errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined' && error.response?.status === 401) {
            console.warn('Unauthorized access detected. Clearing session and redirecting...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Force a reload to clear all state and trigger withAuth redirect
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
