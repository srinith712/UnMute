import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { to: '/dashboard',  icon: '🏠', label: 'Home'          },
    { to: '/practice',   icon: '🎙️', label: 'Practice'       },
    { to: '/interview',  icon: '💼', label: 'Interview'      },
    { to: '/gd',         icon: '💬', label: 'Group Talk'     },
    { to: '/learning',   icon: '📚', label: 'Learn'          },
    { to: '/challenges', icon: '⚡', label: 'Challenges'     },
    { to: '/personality',icon: '🧠', label: 'Personality'    },
];

const LEVEL_LABELS = ['', 'Newcomer', 'Speaker', 'Confident', 'Orator', 'Champion'];

function getLevelLabel(level = 1) {
    return LEVEL_LABELS[level] || `Level ${level}`;
}

export default function Sidebar({ open, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const overlayRef = useRef(null);

    const xpForLevel = (level = 1) => level * 500;
    const xpProgress = Math.min(((user?.xp || 0) % xpForLevel(user?.level || 1)) / xpForLevel(user?.level || 1) * 100, 100);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    /* Close on outside click (mobile) */
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.target === overlayRef.current) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onClose]);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar panel */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col
                w-64 bg-white shadow-card-md border-r border-cream-300
                transition-transform duration-300
                ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-[#E8DCCB]">
                    <div className="w-10 h-10 rounded-xl bg-purple-100
                                    flex items-center justify-center text-xl">
                        🎤
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-base leading-tight">UnMute</p>
                        <p className="text-xs text-gray-500">Level up your voice</p>
                    </div>
                    {/* Close btn (mobile) */}
                    <button onClick={onClose} className="ml-auto md:hidden text-gray-400 hover:text-gray-700 text-xl">✕</button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                isActive ? 'nav-link-active' : 'nav-link'
                            }
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User card */}
                <div className="p-4 border-t border-[#E8DCCB]">
                    <div className="rounded-xl bg-gray-50 border border-[#E8DCCB] p-3 space-y-3">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100
                                            flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">{user?.name || 'User'}</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-purple-500">{getLevelLabel(user?.level)}</span>
                                    <span className="text-gray-300 text-xs">·</span>
                                    <span className="text-xs text-gray-400">{user?.xp || 0} XP</span>
                                </div>
                            </div>
                            <div className="ml-auto flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                {user?.level || 1}
                            </div>
                        </div>

                        {/* XP progress */}
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>XP Progress</span>
                                <span>{Math.round(xpProgress)}%</span>
                            </div>
                            <div className="xp-bar-track">
                                <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left text-xs text-gray-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1.5"
                        >
                            🚪 Sign out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
