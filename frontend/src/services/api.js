import axios from 'axios';

/* ── Base URL ───────────────────────── */
const BASE_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* ── Attach Token ───────────────────────── */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('unmute_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* ── Response Interceptor ───────────────────────── */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('401 Unauthorized (ignored for dashboard/practice)');
        }
        return Promise.reject(error);
    }
);

/* ================= APIs ================= */

/* ── Auth ───────────────────────── */
export const authAPI = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    register: (name, email, password) =>
        api.post('/auth/register', { name, email, password }),

    me: () => api.get('/auth/me'),
};

/* ── Dashboard ───────────────────────── */
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),

    getDailyTasks: () => api.get('/dashboard/tasks'),

    completeTask: (id) =>
        api.post(`/dashboard/tasks/${id}/complete`),

    getProgress: () => api.get('/dashboard/progress'),
};

/* ── Practice ───────────────────────── */
export const practiceAPI = {

    /**
     * PRIMARY: Send transcript text for NLP analysis.
     * No auth required — works for demo users.
     */
    analyzeTranscript: (transcript, topic = 'freestyle') =>
        api.post('/practice/analyze-text', { transcript, topic }),

    /**
     * LEGACY: Upload audio blob (requires real JWT auth).
     */
    uploadAudio: (blob, metadata = {}) => {
        const form = new FormData();
        form.append('audio', blob);
        form.append('metadata', JSON.stringify(metadata));

        return api.post('/practice/analyze', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    getHistory: () => api.get('/practice/history'),
};

/* ── Interview ───────────────────────── */
export const interviewAPI = {
    getQuestions: (category) =>
        api.get(`/interview/questions?category=${category}`),

    submitAnswer: (id, blob) => {
        const form = new FormData();
        form.append('audio', blob);
        form.append('questionId', id);

        return api.post('/interview/evaluate', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

/* ── Group Discussion ───────────────────────── */
export const gdAPI = {
    getRooms: () => api.get('/gd/rooms'),

    createRoom: (name, topic) =>
        api.post('/gd/rooms', { name, topic }),

    joinRoom: (id) =>
        api.post(`/gd/rooms/${id}/join`),
};

/* ── Learning ───────────────────────── */
export const learningAPI = {
    getVideos: () => api.get('/learning/videos'),

    completeVideo: (id) =>
        api.post(`/learning/videos/${id}/complete`),
};

export default api;