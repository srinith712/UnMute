import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/* ── Demo user ───────────────────────── */
const DEMO_EMAIL = 'demo@unmute.app';
const DEMO_PASSWORD = 'Demo@1234';

const DEMO_USER = {
    id: 'demo-1',
    name: 'Demo User',
    email: DEMO_EMAIL,
    level: 3,
    xp: 1250,
};

/* ── Provider ───────────────────────── */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ── Load user from storage ───────────────────────── */
    useEffect(() => {
        try {
            const token = localStorage.getItem('unmute_token');
            const savedUser = localStorage.getItem('unmute_user');

            if (token && savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch {
            localStorage.removeItem('unmute_token');
            localStorage.removeItem('unmute_user');
        } finally {
            setLoading(false);
        }
    }, []);

    /* ── Login ───────────────────────── */
    const login = useCallback(async (email, password) => {
        setError(null);

        /* Demo login */
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            const token = 'demo-token';

            localStorage.setItem('unmute_token', token);
            localStorage.setItem('unmute_user', JSON.stringify(DEMO_USER));

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
            const msg =
                err.response?.data?.message ||
                'Login failed. Please try again.';

            setError(msg);
            return { success: false, message: msg };
        }
    }, []);

    /* ── Register ───────────────────────── */
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
            const msg =
                err.response?.data?.message ||
                'Registration failed. Please try again.';

            setError(msg);
            return { success: false, message: msg };
        }
    }, []);

    /* ── Logout ───────────────────────── */
    const logout = useCallback(() => {
        localStorage.removeItem('unmute_token');
        localStorage.removeItem('unmute_user');

        delete api.defaults.headers.common['Authorization'];

        setUser(null);
    }, []);

    /* ── Update user ───────────────────────── */
    const updateUser = useCallback((updates) => {
        setUser(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('unmute_user', JSON.stringify(updated));
            return updated;
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

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/* ── Hook ───────────────────────── */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}

export default AuthContext;