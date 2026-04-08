import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { to: '/dashboard', icon: '🏠', label: 'Home' },
    { to: '/practice', icon: '🎤', label: 'Practice' },
    { to: '/interview', icon: '💼', label: 'Interview' },
    { to: '/gd', icon: '💬', label: 'Group Discussion' },
    { to: '/learning', icon: '📚', label: 'Learning' },
    { to: '/challenges', icon: '⚡', label: 'Challenges' },
    { to: '/personality', icon: '🧠', label: 'Personality' },
];

export default function Sidebar({ open, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const overlayRef = useRef(null);

    /* ── Logout ───────────────────────── */
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    /* ── Close on outside click ───────────────────────── */
    useEffect(() => {
        const handleClick = (e) => {
            if (overlayRef.current && e.target === overlayRef.current) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    /* ── User initials ───────────────────────── */
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    /* ── XP progress (simple version) ───────────────────────── */
    const level = user?.level || 1;
    const xp = user?.xp || 0;

    const xpNeeded = level * 500;
    const progress = Math.min((xp % xpNeeded) / xpNeeded * 100, 100);

    return (
        <>
            {/* Overlay (mobile) */}
            {open && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 bg-black/30 md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:static top-0 left-0 h-screen w-64 bg-white border-r
        transform transition-transform
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>

                {/* Logo */}
                <div className="p-4 border-b flex items-center gap-2">
                    <span className="text-xl">🎤</span>
                    <div>
                        <p className="font-semibold">UnMute</p>
                        <p className="text-xs text-gray-500">Practice speaking</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-auto md:hidden"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded text-sm
                ${isActive ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`
                            }
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="mt-auto p-3 border-t">

                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-200 rounded flex items-center justify-center text-sm font-bold">
                            {initials}
                        </div>

                        <div>
                            <p className="text-sm font-medium">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">
                                Level {level} • {xp} XP
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 h-2 rounded mb-2">
                        <div
                            className="h-2 bg-purple-500 rounded"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500"
                    >
                        Logout
                    </button>

                </div>

            </aside>
        </>
    );
}