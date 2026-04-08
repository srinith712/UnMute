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

/* Loader */
function Loader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
}

/* Protected Route */
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <Loader />;

    return user ? children : <Navigate to="/login" replace />;
}

/* Public Route */
function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <Loader />;

    return user ? <Navigate to="/dashboard" replace /> : children;
}

/* Root redirect */
function RootRedirect() {
    const { user, loading } = useAuth();

    if (loading) return <Loader />;

    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* Root */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* Public */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    {/* Protected */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
                    <Route path="/interview" element={<ProtectedRoute><InterviewMode /></ProtectedRoute>} />
                    <Route path="/gd" element={<ProtectedRoute><GroupDiscussion /></ProtectedRoute>} />
                    <Route path="/personality" element={<ProtectedRoute><PersonalityModule /></ProtectedRoute>} />
                    <Route path="/learning" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
                    <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}