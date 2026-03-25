import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/* ── Demo user (used when backend is unavailable) ─────────────── */
const DEMO_EMAIL    = 'demo@unmute.app';
const DEMO_PASSWORD = 'Demo@1234';
const DEMO_USER     = {
    id: 'demo-1',
    name: 'Demo User',
    email: DEMO_EMAIL,
    level: 3,
    xp: 1250,
    rating: 78,
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ── Bootstrap: read token from localStorage on mount ─────── */
    useEffect(() => {
        const token = localStorage.getItem('unmute_token');
        const saved = localStorage.getItem('unmute_user');

        if (token && saved) {
            try {
                const parsed = JSON.parse(saved);
                setUser(parsed);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch {
                localStorage.removeItem('unmute_token');
                localStorage.removeItem('unmute_user');
            }
        }
        setLoading(false);
    }, []);

    /* ── Login ──────────────────────────────────────────────────── */
    const login = useCallback(async (email, password) => {
        setError(null);

        /* Demo mode – works even without backend */
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            const demoToken = 'demo-jwt-token';
            localStorage.setItem('unmute_token', demoToken);
            localStorage.setItem('unmute_user', JSON.stringify(DEMO_USER));
            api.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
            setUser(DEMO_USER);
            return { success: true };
        }

        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user: userData } = res.data;

            localStorage.setItem('unmute_token', token);
            localStorage.setItem('unmute_user', JSON.stringify(userData));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
            return { success: false, message: msg };
        }
    }, []);

    /* ── Register ────────────────────────────────────────────────── */
    const register = useCallback(async (name, email, password) => {
        setError(null);
        try {
            const res = await api.post('/auth/register', { name, email, password });
            const { token, user: userData } = res.data;

            localStorage.setItem('unmute_token', token);
            localStorage.setItem('unmute_user', JSON.stringify(userData));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            return { success: false, message: msg };
        }
    }, []);

    /* ── Logout ──────────────────────────────────────────────────── */
    const logout = useCallback(() => {
        localStorage.removeItem('unmute_token');
        localStorage.removeItem('unmute_user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    }, []);

    /* ── Update user profile in context ─────────────────────────── */
    const updateUser = useCallback((updates) => {
        setUser(prev => {
            const next = { ...prev, ...updates };
            localStorage.setItem('unmute_user', JSON.stringify(next));
            return next;
        });
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
