import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;


if (!BASE_URL) {
    throw new Error(
        '[UnMute] API URL is not set. ' +
        'Set REACT_APP_API_URL in environment variables.'
    );
}

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/* ── Request interceptor: attach token ───────────────────────── */
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

/* ── Response interceptor: handle 401 globally ───────────────── */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('unmute_token');
            localStorage.removeItem('unmute_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/* ═══════════════════════════════════════════════════════════════
   API Service Functions
═══════════════════════════════════════════════════════════════ */

/* ── Auth ─────────────────────────────────────────────────────── */
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
    me: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

/* ── Dashboard ────────────────────────────────────────────────── */
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getDailyTasks: () => api.get('/dashboard/tasks'),
    completeTask: (taskId) => api.post(`/dashboard/tasks/${taskId}/complete`),
    getProgress: () => api.get('/dashboard/progress'),
};

/* ── Speech / Practice ────────────────────────────────────────── */
export const practiceAPI = {
    /** Upload audio blob and get AI feedback */
    uploadAudio: (audioBlob, metadata = {}) => {
        const form = new FormData();
        form.append('audio', audioBlob, 'recording.webm');
        form.append('metadata', JSON.stringify(metadata));
        return api.post('/practice/analyze', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getTopics: () => api.get('/practice/topics'),
    getHistory: () => api.get('/practice/history'),
};

/* ── Interview Mode ───────────────────────────────────────────── */
export const interviewAPI = {
    getQuestions: (category = 'hr') => api.get(`/interview/questions?category=${category}`),
    submitAnswer: (questionId, audioBlob) => {
        const form = new FormData();
        form.append('audio', audioBlob, 'answer.webm');
        form.append('questionId', questionId);
        return api.post('/interview/evaluate', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getHistory: () => api.get('/interview/history'),
};

/* ── Group Discussion ─────────────────────────────────────────── */
export const gdAPI = {
    getRooms: () => api.get('/gd/rooms'),
    createRoom: (name, topic) => api.post('/gd/rooms', { name, topic }),
    joinRoom: (roomId) => api.post(`/gd/rooms/${roomId}/join`),
    leaveRoom: (roomId) => api.post(`/gd/rooms/${roomId}/leave`),
};

/* ── User Profile ─────────────────────────────────────────────── */
export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data),
    getLeaderboard: () => api.get('/user/leaderboard'),
};

/* ── Learning Hub ─────────────────────────────────────────────── */
export const learningAPI = {
    getVideos: (category = 'all') =>
        api.get(`/api/learning/videos${category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`),
    completeVideo: (videoId) => api.post(`/api/learning/videos/${videoId}/complete`),
};

/* ── Challenges ───────────────────────────────────────────────── */
export const challengesAPI = {
    getChallenges: () => api.get('/api/challenges'),
    submitChallenge: (challengeId, audioBlob, metadata = {}) => {
        const form = new FormData();
        form.append('audio', audioBlob, 'challenge.webm');
        form.append('metadata', JSON.stringify(metadata));
        return api.post(`/api/challenges/${challengeId}/submit`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

/* ── Daily Missions ───────────────────────────────────────────── */
export const missionsAPI = {
    getDaily: () => api.get('/api/missions/daily'),
    complete: (missionId) => api.post(`/api/missions/${missionId}/complete`),
};

export default api;

