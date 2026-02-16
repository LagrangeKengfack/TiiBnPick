import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized error (e.g., redirect to login or clear session)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
