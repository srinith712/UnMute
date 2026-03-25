import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import InterviewMode from './pages/InterviewMode';
import GroupDiscussion from './pages/GroupDiscussion';
import PersonalityModule from './pages/PersonalityModule';
import LearningHub from './pages/LearningHub';
import Challenges from './pages/Challenges';

/* Protected wrapper */
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                    <p className="text-ink-400 text-sm">Loading UnMute…</p>
                </div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
}

/* Public-only wrapper (redirect logged-in users to dashboard) */
function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    {/* Protected routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
                    <Route path="/interview" element={<ProtectedRoute><InterviewMode /></ProtectedRoute>} />
                    <Route path="/gd" element={<ProtectedRoute><GroupDiscussion /></ProtectedRoute>} />
                    <Route path="/personality" element={<ProtectedRoute><PersonalityModule /></ProtectedRoute>} />
                    <Route path="/learning" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
                    <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

