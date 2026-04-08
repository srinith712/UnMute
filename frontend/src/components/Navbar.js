import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_LABELS = {
    '/dashboard': 'Dashboard',
    '/practice': 'Practice',
    '/interview': 'Interview',
    '/gd': 'Group Discussion',
    '/learning': 'Learning',
    '/challenges': 'Challenges',
    '/personality': 'Personality',
};

export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef(null);

    const pageTitle = PAGE_LABELS[location.pathname] || 'UnMute';

    /* ── Logout ───────────────────────── */
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    /* ── Close dropdown on outside click ───────────────────────── */
    useEffect(() => {
        const handleClick = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setDropOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    /* ── Close dropdown on route change ───────────────────────── */
    useEffect(() => {
        setDropOpen(false);
    }, [location.pathname]);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="flex justify-between items-center px-4 py-3 border-b bg-white">

            {/* Left */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onMenuClick}
                    className="md:hidden px-2 py-1 border rounded"
                >
                    ☰
                </button>

                <div>
                    <h1 className="font-semibold text-gray-800">
                        {pageTitle}
                    </h1>
                    <p className="text-xs text-gray-500 hidden sm:block">
                        UnMute Platform
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">

                {/* XP */}
                <div className="hidden sm:block text-sm text-purple-600">
                    ⚡ {user?.xp || 0} XP
                </div>

                {/* Avatar */}
                <div className="relative" ref={dropRef}>
                    <button
                        onClick={() => setDropOpen(prev => !prev)}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 bg-purple-200 rounded flex items-center justify-center text-sm font-bold">
                            {initials}
                        </div>

                        <span className="hidden sm:block text-sm">
                            {user?.name || 'User'}
                        </span>
                    </button>

                    {/* Dropdown */}
                    {dropOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow">

                            <div className="p-2 border-b">
                                <p className="text-sm font-semibold">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>

                            <button
                                onClick={() => navigate('/learning')}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                            >
                                Learning
                            </button>

                            <button
                                onClick={() => navigate('/challenges')}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                            >
                                Challenges
                            </button>

                            <button
                                onClick={() => navigate('/personality')}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                            >
                                Personality
                            </button>

                            <hr />

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                                Logout
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}