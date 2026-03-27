import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProgressChart from '../components/ProgressChart';
import DailyTaskCard from '../components/DailyTaskCard';
import MissionTracker from '../components/MissionTracker';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, bg }) {
    return (
        <div className="card hover:shadow-md transition flex flex-col gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${bg}`}>
                {icon}
            </div>
            <p className="text-gray-500 text-xs font-medium">{label}</p>
            <p className="text-gray-800 text-2xl font-bold leading-none">{value}</p>
            {sub && <p className="text-gray-400 text-xs">{sub}</p>}
        </div>
    );
}

/* ── Quick action button ──────────────────────────────────── */
function QuickAction({ to, icon, label, bg }) {
    return (
        <Link
            to={to}
            className="card hover:shadow-md transition flex flex-col items-center gap-2 text-center cursor-pointer"
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${bg}`}>
                {icon}
            </div>
            <span className="text-gray-500 text-xs font-medium">
                {label}
            </span>
        </Link>
    );
}

export default function Dashboard() {
    const { user, updateUser } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, tasksRes, progressRes] = await Promise.allSettled([
                dashboardAPI.getStats(),
                dashboardAPI.getDailyTasks(),
                dashboardAPI.getProgress(),
            ]);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data?.tasks || []);
            if (progressRes.status === 'fulfilled') setProgress(progressRes.value.data);
        } catch {
            /* Use demo data silently */
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCompleteTask = async (taskId) => {
        try {
            const res = await dashboardAPI.completeTask(taskId);
            if (res.data?.xpEarned) {
                updateUser({ xp: (user?.xp || 0) + res.data.xpEarned });
            }
        } catch { /* ignore */ }
    };

    /* ── Demo stats if backend unavailable ─────────────────── */
    const displayStats = stats || {
        xp: user?.xp || 1250,
        level: user?.level || 3,
        rating: user?.rating || 78,
        sessions: 24,
        streak: 7,
        rank: '#42',
    };

    const xpToNext = 1000 - (displayStats.xp % 1000);
    const xpPercent = ((displayStats.xp % 1000) / 1000) * 100;

    const greetingHour = new Date().getHours();
    const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="layout-root">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="layout-main">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="layout-content">
                    {/* ── Hero Greeting Banner ─────────────────── */}
                    <div className="card mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-500 text-sm">{greeting},</p>
                                <h2 className="font-semibold text-2xl text-gray-800 mt-0.5">
                                    {user?.name?.split(' ')[0] || 'Champion'} 👋
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Ready to level up your communication today?
                                </p>

                                {/* XP progress */}
                                <div className="mt-4 max-w-xs">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-500 font-medium">Level {displayStats.level}</span>
                                        <span className="text-purple-500 font-semibold">{displayStats.xp} XP ⚡</span>
                                    </div>
                                    <div className="xp-bar-track">
                                        <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">{xpToNext} XP to Level {displayStats.level + 1}</p>
                                </div>
                            </div>

                            {/* Streak badge */}
                            <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0">
                                <div className="w-18 h-18 rounded-xl flex flex-col items-center justify-center
                                    bg-orange-50 border border-orange-200 px-4 py-3">
                                    <span className="text-orange-500 text-2xl font-bold">{displayStats.streak}</span>
                                    <span className="text-gray-500 text-[10px]">day streak</span>
                                </div>
                                <span className="text-orange-500 text-xs font-medium">🔥 On fire!</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Stat Cards ───────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard icon="⭐" label="Rating Score"  value={displayStats.rating}         sub="out of 100"   bg="bg-orange-50" />
                        <StatCard icon="🎯" label="Sessions Done" value={displayStats.sessions}        sub="all time"     bg="bg-blue-50" />
                        <StatCard icon="🏆" label="Global Rank"   value={displayStats.rank}            sub="leaderboard"  bg="bg-green-50" />
                        <StatCard icon="🔥" label="Day Streak"    value={`${displayStats.streak}d`}   sub="keep going!"  bg="bg-orange-50" />
                    </div>

                    {/* ── Quick Actions ────────────────────────── */}
                    <div className="mb-6">
                        <h3 className="section-title mb-3">🚀 Jump Back In</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <QuickAction to="/practice"    icon="🎤" label="Practice Speech"   bg="bg-orange-50" />
                            <QuickAction to="/interview"   icon="💼" label="Mock Interview"     bg="bg-blue-50" />
                            <QuickAction to="/gd"          icon="👥" label="Group Discussion"   bg="bg-green-50" />
                            <QuickAction to="/learning"    icon="📚" label="Learning Hub"       bg="bg-purple-50" />
                            <QuickAction to="/challenges"  icon="⚡" label="Challenges"         bg="bg-orange-50" />
                            <QuickAction to="/personality" icon="🧠" label="Personality"        bg="bg-purple-50" />
                        </div>
                    </div>

                    {/* ── Chart + Tasks + Missions ─────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        <div className="lg:col-span-3 space-y-5">
                            <ProgressChart data={progress?.weekly} loading={loading} />
                            <MissionTracker />
                        </div>
                        <div className="lg:col-span-2">
                            <DailyTaskCard tasks={tasks} onComplete={handleCompleteTask} loading={loading} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
