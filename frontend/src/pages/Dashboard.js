import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DailyTaskCard from '../components/DailyTaskCard';
import ProgressChart from '../components/ProgressChart';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── Stat Card ───────────────────────── */
function StatCard({ icon, label, value, sub, color = 'purple' }) {

    const colors = {
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        green:  'bg-green-50  text-green-600',
        blue:   'bg-blue-50   text-blue-600',
    };

    return (
        <div className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </div>
        </div>
    );
}

/* ── Dashboard ───────────────────────── */
export default function Dashboard() {

    const { user } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [task,    setTask]    = useState(null);
    const [stats,   setStats]   = useState(null);
    const [progress, setProgress] = useState([]);
    const [loadingTask,  setLoadingTask]  = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingChart, setLoadingChart] = useState(true);

    /* ── Fetch daily task ───────────────────────── */
    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await dashboardAPI.getDailyTasks();
                const today  = new Date().toISOString().split('T')[0];
                const stored = (() => {
                    try { return JSON.parse(localStorage.getItem('dailyTask')); }
                    catch { return null; }
                })();

                let apiTask = res.data?.tasks?.[0] || null;

                /* Fallback if backend returns nothing */
                if (!apiTask) {
                    apiTask = {
                        id: '1',
                        title: 'Practice Speaking',
                        description: 'Record a 60-second speech on any topic',
                        type: 'practice',
                        completed: false,
                        xpReward: 50,
                    };
                }

                /* Mark completed from localStorage */
                if (stored && stored.date === today && stored.taskId === apiTask.id) {
                    apiTask = { ...apiTask, completed: true };
                }

                /* Store today's task ID in sessionStorage for Practice page to read */
                sessionStorage.setItem('todayTaskId', apiTask.id);

                setTask(apiTask);
            } catch {
                setTask({
                    id: '1',
                    title: 'Practice Speaking',
                    description: 'Record a 60-second speech on any topic',
                    type: 'practice',
                    completed: false,
                    xpReward: 50,
                });
            } finally {
                setLoadingTask(false);
            }
        };

        fetchTask();
    }, []);

    /* ── Fetch stats ───────────────────────── */
    useEffect(() => {
        dashboardAPI.getStats()
            .then(res  => setStats(res.data))
            .catch(() => setStats(null))
            .finally(() => setLoadingStats(false));
    }, []);

    /* ── Fetch progress chart ───────────────────────── */
    useEffect(() => {
        dashboardAPI.getProgress()
            .then(res  => {
                // Backend returns { weekly: [...] }
                const raw = res.data?.weekly || [];
                // Remap to what ProgressChart expects: { day, overall, fluency, grammar }
                const mapped = raw.map(p => ({
                    day:      p.date || p.day,
                    overall:  p.overall  || 0,
                    fluency:  p.fluency  || 0,
                    grammar:  p.grammar  || 0,
                }));
                setProgress(mapped);
            })
            .catch(() => setProgress([]))
            .finally(() => setLoadingChart(false));
    }, []);

    /* ── Derived stat values ───────────────────────── */
    const displayXp     = stats?.xp      ?? user?.xp    ?? 0;
    const displayLevel  = stats?.level   ?? user?.level ?? 1;
    const displayRating = stats?.rating  != null ? stats.rating.toFixed(1) : '—';
    const displayStreak = stats?.streak  ?? 0;

    return (
        <div className="flex">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1">

                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">

                    {/* Header */}
                    <div>
                        <h2 className="page-title">
                            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
                        </h2>
                        <p className="page-subtitle">Here's your progress summary</p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon="⚡"
                            label="Total XP"
                            value={loadingStats ? '…' : displayXp.toLocaleString()}
                            color="purple"
                        />
                        <StatCard
                            icon="🏆"
                            label="Level"
                            value={loadingStats ? '…' : displayLevel}
                            sub="Keep going!"
                            color="orange"
                        />
                        <StatCard
                            icon="⭐"
                            label="Rating"
                            value={loadingStats ? '…' : displayRating}
                            sub="out of 5"
                            color="blue"
                        />
                        <StatCard
                            icon="🔥"
                            label="Streak"
                            value={loadingStats ? '…' : `${displayStreak}d`}
                            sub="days"
                            color="green"
                        />
                    </div>

                    {/* Daily Task — EXACTLY ONE */}
                    <div>
                        <h3 className="section-title mb-3">Today's Task</h3>
                        <DailyTaskCard
                            task={task}
                            loading={loadingTask}
                        />
                    </div>

                    {/* Progress Chart */}
                    <div>
                        <ProgressChart
                            data={progress}
                            title="Weekly Progress"
                            loading={loadingChart}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}