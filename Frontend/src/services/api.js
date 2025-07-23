import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
    baseURL,
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // You can add auth token here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        toast.error(message);
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/users/register', data),
    login: (data) => api.post('/users/login', data),
    logout: () => api.post('/users/logout'),
    getCurrentUser: () => api.get('/users/current-user'),
};

// Quiz APIs
export const quizAPI = {
    create: (data) => api.post('/quizzes/create', data),
    generateAI: (data) => api.post('/quizzes/ai-generate', data),
    getByCode: (code) => api.get(`/quizzes/code/${code}`),
    update: (id, data) => api.patch(`/quizzes/${id}`, data),
    delete: (id) => api.delete(`/quizzes/${id}`),
};

// Session APIs
export const sessionAPI = {
    start: (data) => api.post('/sessions/start', data),
    join: (data) => api.post('/sessions/join', data),
    submitAnswer: (sessionId, data) => api.post(`/sessions/${sessionId}/submit`, data),
    getResults: (sessionId) => api.get(`/sessions/${sessionId}/results`),
}; 