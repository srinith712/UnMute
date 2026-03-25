import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TYPE_BADGE = {
    practice:  'badge-orange',
    interview: 'badge-sky',
    gd:        'badge-mint',
    learning:  'badge-lavender',
    challenge: 'badge-peach',
};

const FUN_COMPLETE = [
    "Mission complete! You're on fire! 🔥",
    "Grammar police approve. XP incoming! 🚔",
    "Even CEOs started with awkward first steps. You're past that! 💼",
    "Achievement unlocked! 🏆",
];

export default function MissionTracker() {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(null);
    const [flash, setFlash] = useState(null);

    useEffect(() => {
        api.get('/api/missions/daily')
            .then(res => setMissions(res.data || []))
            .catch(() => {
                setMissions([
                    { id: 'm1', title: 'Morning Warm-Up 🌅',    description: 'Record a 60-second speech',      type: 'practice',  xpReward: 50,  icon: '🎤', completed: false },
                    { id: 'm2', title: 'Interview Hero 💼',       description: 'Answer one HR question',         type: 'interview', xpReward: 75,  icon: '⭐', completed: false },
                    { id: 'm3', title: 'Group Thinker 🤝',        description: 'Join a group discussion',        type: 'gd',        xpReward: 100, icon: '👥', completed: false },
                    { id: 'm4', title: 'Learn Something New 📚',  description: 'Watch a learning video',         type: 'learning',  xpReward: 30,  icon: '🎬', completed: false },
                    { id: 'm5', title: 'Challenge Accepted 🔥',   description: 'Complete any speaking challenge', type: 'challenge', xpReward: 80,  icon: '🏆', completed: false },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleComplete = async (mission) => {
        if (mission.completed || completing === mission.id) return;
        setCompleting(mission.id);
        try {
            await api.post(`/api/missions/${mission.id}/complete`);
        } catch { /* optimistic anyway */ }
        setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, completed: true } : m));
        const msg = FUN_COMPLETE[Math.floor(Math.random() * FUN_COMPLETE.length)];
        setFlash({ missionId: mission.id, msg });
        setTimeout(() => setFlash(null), 3000);
        setCompleting(null);
    };

    const completed = missions.filter(m => m.completed).length;
    const totalXP   = missions.reduce((s, m) => s + (m.completed ? 0 : m.xpReward), 0);

    if (loading) {
        return (
            <div className="card p-5 space-y-3 animate-pulse">
                <div className="h-4 rounded-xl bg-cream-200 w-40" />
                {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-2xl bg-cream-200" />)}
            </div>
        );
    }

    return (
        <div className="card p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="section-title text-base">🎯 Daily Missions</h3>
                    <p className="section-sub mt-0.5">{completed}/{missions.length} done · {totalXP} XP available</p>
                </div>
                {/* Progress dots */}
                <div className="flex gap-1.5">
                    {missions.map(m => (
                        <div key={m.id} className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                            ${m.completed ? 'bg-mint-400 scale-110' : 'bg-cream-300'}`} />
                    ))}
                </div>
            </div>

            {/* Mission list */}
            <div className="space-y-2">
                {missions.map(mission => (
                    <div key={mission.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border-2
                        transition-all duration-200
                        ${mission.completed
                            ? 'bg-mint-50 border-mint-200 opacity-70'
                            : 'bg-cream-100 border-cream-200 hover:border-orange-200 hover:bg-white'}`}
                    >
                        <div className="text-xl flex-shrink-0">{mission.icon}</div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${mission.completed ? 'line-through text-ink-400' : 'text-ink-900'}`}>
                                {mission.title}
                            </p>
                            <p className="text-ink-400 text-[10px] truncate">{mission.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`badge ${TYPE_BADGE[mission.type] || 'badge-purple'}`}>{mission.type}</span>
                            <span className="text-mint-500 font-bold text-xs">+{mission.xpReward}</span>
                            {mission.completed ? (
                                <div className="w-5 h-5 rounded-full bg-mint-400 flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">✓</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleComplete(mission)}
                                    disabled={completing === mission.id}
                                    className="w-5 h-5 rounded-full border-2 border-cream-400 bg-white
                                               hover:border-mint-400 hover:bg-mint-50 transition-all duration-200 flex-shrink-0"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Flash message */}
            {flash && (
                <div className="p-2.5 rounded-2xl bg-mint-100 border-2 border-mint-300 text-mint-600 text-xs text-center font-semibold animate-slide-up">
                    {flash.msg}
                </div>
            )}
        </div>
    );
}
