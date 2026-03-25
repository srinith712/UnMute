import React, { useState } from 'react';

/* ── Default task list ───────────────────────────────────────── */
const DEFAULT_TASKS = [
    { id: 1, title: 'Record a 2-minute self-introduction', xp: 50,  category: 'Practice',   icon: '🎤' },
    { id: 2, title: 'Complete 1 HR interview question',     xp: 75,  category: 'Interview',  icon: '💼' },
    { id: 3, title: 'Join a Group Discussion room',         xp: 60,  category: 'GD',         icon: '👥' },
    { id: 4, title: "Read today's communication tip",       xp: 20,  category: 'Learning',   icon: '📖' },
    { id: 5, title: 'Achieve score ≥ 70 in any session',   xp: 100, category: 'Challenge',  icon: '⚡' },
];

const categoryColors = {
    Practice:  'badge-orange',
    Interview: 'badge-sky',
    GD:        'badge-mint',
    Learning:  'badge-lavender',
    Challenge: 'badge-peach',
};

/**
 * DailyTaskCard
 * Props:
 *   tasks           – array of { id, title, xp, category, icon, completed }
 *   onComplete(id)  – called when a task is marked complete
 *   loading         – show skeleton
 */
export default function DailyTaskCard({ tasks, onComplete, loading = false }) {
    const [localDone, setLocalDone] = useState({});

    const taskList = tasks?.length ? tasks : DEFAULT_TASKS;

    const handleToggle = (id) => {
        if (localDone[id]) return;
        setLocalDone(prev => ({ ...prev, [id]: true }));
        onComplete?.(id);
    };

    const doneCount  = taskList.filter(t => t.completed || localDone[t.id]).length;
    const totalXP    = taskList.reduce((acc, t) =>
        (t.completed || localDone[t.id]) ? acc + (t.xp || 0) : acc, 0
    );

    if (loading) {
        return (
            <div className="card p-5 space-y-3 animate-pulse">
                <div className="h-4 w-32 bg-cream-200 rounded" />
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-cream-200 rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="card p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="section-title text-base">📋 Daily Tasks</h3>
                    <p className="section-sub mt-0.5">
                        {doneCount}/{taskList.length} done · +{totalXP} XP earned
                    </p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                    <span className="text-ink-900 font-extrabold text-xl leading-none">{doneCount}</span>
                    <span className="text-ink-400 text-[10px] font-medium">done</span>
                </div>
            </div>

            {/* Overall progress */}
            <div className="xp-bar-track mb-4">
                <div
                    className="xp-bar-fill transition-all duration-700"
                    style={{ width: taskList.length ? `${(doneCount / taskList.length) * 100}%` : '0%' }}
                />
            </div>

            {/* Task list */}
            <ul className="space-y-2">
                {taskList.map(task => {
                    const done = task.completed || localDone[task.id];
                    return (
                        <li key={task.id}>
                            <button
                                onClick={() => handleToggle(task.id)}
                                disabled={done}
                                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left
                  transition-all duration-200 border-2
                  ${done
                                    ? 'bg-mint-100 border-mint-200 cursor-default opacity-70'
                                    : 'bg-cream-100 border-cream-200 hover:border-orange-300 hover:bg-white hover:-translate-y-0.5'
                                }`}
                            >
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                                    ${done ? 'bg-mint-400 border-mint-400' : 'border-cream-400 bg-white'}`}>
                                    {done && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>

                                {/* Icon + text */}
                                <span className="text-lg flex-shrink-0">{task.icon}</span>
                                <p className={`flex-1 text-sm leading-snug font-medium
                                    ${done ? 'text-ink-400 line-through' : 'text-ink-800'}`}>
                                    {task.title}
                                </p>

                                {/* Category + XP */}
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className={`badge text-[9px] ${categoryColors[task.category] || 'badge-purple'}`}>
                                        {task.category}
                                    </span>
                                    <span className={`text-[10px] font-bold ${done ? 'text-mint-500' : 'text-orange-500'}`}>
                                        {done ? '✓' : '+'}{task.xp} XP
                                    </span>
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* All done message */}
            {doneCount === taskList.length && (
                <div className="mt-4 p-3 rounded-2xl bg-mint-100 border-2 border-mint-300 text-center">
                    <p className="text-mint-500 font-bold text-sm">🎉 All tasks complete! Amazing work!</p>
                </div>
            )}
        </div>
    );
}
