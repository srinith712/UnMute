import React from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Route map for task types ───────────────────────── */
const TYPE_ROUTE = {
    practice:  '/practice',
    interview: '/interview',
    gd:        '/gd',
    learning:  '/learning',
    challenge: '/challenges',
};

const TYPE_LABEL = {
    practice:  '🎤 Practice',
    interview: '💼 Interview',
    gd:        '💬 Group Discussion',
    learning:  '📚 Learning',
    challenge: '⚡ Challenge',
};

/**
 * DailyTaskCard
 *
 * Props:
 *   task    — single task object { id, title, description, type, completed, xpReward }
 *   loading — boolean
 */
export default function DailyTaskCard({ task, loading }) {

    const navigate = useNavigate();

    /* ── Loading skeleton ───────────────────────── */
    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-64 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
        );
    }

    /* ── No task ───────────────────────── */
    if (!task) {
        return (
            <div className="card text-center text-gray-400 py-6">
                No task available today.
            </div>
        );
    }

    const route     = TYPE_ROUTE[task.type] || '/practice';
    const typeLabel = TYPE_LABEL[task.type]  || task.type;

    const handleGoToTask = () => {
        navigate(route);
    };

    return (
        <div className={`card border-l-4 ${task.completed
            ? 'border-green-400'
            : 'border-purple-500'
        }`}>
            <div className="flex items-start justify-between gap-4">

                {/* Left: info */}
                <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-purple text-xs">{typeLabel}</span>
                        {task.xpReward != null && (
                            <span className="badge badge-orange text-xs">
                                +{task.xpReward} XP
                            </span>
                        )}
                    </div>

                    <p className="font-semibold text-gray-800 text-sm mt-1">
                        {task.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {task.description}
                    </p>

                    {/* Completion hint */}
                    <p className="text-xs text-gray-400 mt-2 italic">
                        {task.completed
                            ? '✅ Completed today'
                            : 'Auto-completes after you finish the activity'}
                    </p>

                </div>

                {/* Right: status + action */}
                <div className="flex flex-col items-end gap-2 shrink-0">

                    <span className={`badge text-xs font-semibold ${task.completed
                        ? 'badge-green'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                        {task.completed ? '✅ Done' : 'Pending'}
                    </span>

                    {!task.completed && (
                        <button
                            id={`go-task-${task.id}`}
                            onClick={handleGoToTask}
                            className="btn-primary text-xs px-3 py-1.5"
                        >
                            Start →
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
}