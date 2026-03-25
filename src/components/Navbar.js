import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_LABELS = {
    '/dashboard':   '🏠 Dashboard',
    '/practice':    '🎙️ Practice',
    '/interview':   '💼 Interview',
    '/gd':          '💬 Group Talk',
    '/learning':    '📚 Learning Hub',
    '/challenges':  '⚡ Challenges',
    '/personality': '🧠 Personality',
};

export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef(null);

    const pageTitle = PAGE_LABELS[location.pathname] || '🎤 UnMute';

    const handleLogout = () => { logout(); navigate('/login'); };

    useEffect(() => {
        if (!dropOpen) return;
        const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [dropOpen]);

    useEffect(() => { setDropOpen(false); }, [location.pathname]);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6
                           bg-white border-b border-[#E8DCCB] shadow-sm">

            {/* Left — hamburger + title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden w-9 h-9 rounded-xl bg-cream-100 hover:bg-cream-200
                               flex items-center justify-center text-ink-500 transition-colors"
                    aria-label="Open menu"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div>
                    <h1 className="font-semibold text-gray-800 text-base leading-tight">{pageTitle}</h1>
                    <p className="text-gray-500 text-xs hidden sm:block">UnMute Platform</p>
                </div>
            </div>

            {/* Right — XP pill + avatar */}
            <div className="flex items-center gap-3">
                {/* XP badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                bg-purple-50 border border-purple-200">
                    <span className="text-base">⚡</span>
                    <span className="text-purple-500 font-semibold text-sm">{user?.xp || 0}</span>
                    <span className="text-purple-400 text-xs">XP</span>
                </div>

                {/* Streak badge */}
                <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                                bg-orange-50 border border-orange-200">
                    <span className="text-sm">🔥</span>
                    <span className="text-orange-500 font-semibold text-sm">{user?.rating || 0}</span>
                </div>

                {/* Avatar dropdown */}
                <div className="relative" ref={dropRef}>
                    <button
                        onClick={() => setDropOpen(p => !p)}
                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
                                   hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-xl bg-purple-100
                                        flex items-center justify-center text-purple-600 font-semibold text-sm">
                            {initials}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-gray-800 font-semibold text-xs leading-tight">{user?.name || 'User'}</p>
                            <p className="text-gray-400 text-[10px]">Level {user?.level || 1}</p>
                        </div>
                        <svg className={`w-4 h-4 text-ink-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {dropOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-md
                                        border border-[#E8DCCB] py-2 z-50 animate-pop-in">
                            <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                                <p className="text-gray-400 text-xs">{user?.email}</p>
                            </div>
                            {[
                                ['/learning',    '📚 Learning Hub'],
                                ['/challenges',  '⚡ Challenges'],
                                ['/personality', '🧠 Personality'],
                            ].map(([path, label]) => (
                                <button key={path}
                                    onClick={() => { setDropOpen(false); navigate(path); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-600
                                               hover:bg-gray-50 hover:text-gray-800 transition-colors"
                                >
                                    {label}
                                </button>
                            ))}
                            <div className="border-t border-gray-100 my-1" />
                            <button
                                onClick={() => { setDropOpen(false); handleLogout(); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 font-medium
                                           hover:bg-red-50 transition-colors"
                            >
                                🚪 Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
