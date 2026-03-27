import React, { useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

/* ─── Category tabs ──────────────────────────────────────────── */
const CATEGORIES = [
    { id: 'all',            label: 'All Videos',    icon: '🎬' },
    { id: 'Interview Tips', label: 'Interview Tips', icon: '💼' },
    { id: 'Body Language',  label: 'Body Language',  icon: '💪' },
    { id: 'Voice & Tone',   label: 'Voice & Tone',   icon: '🔊' },
    { id: 'GD Techniques',  label: 'GD Techniques',  icon: '🤝' },
    { id: 'Storytelling',   label: 'Storytelling',   icon: '📖' },
];

const DIFFICULTY_COLORS = {
    BEGINNER:     'badge-mint',
    INTERMEDIATE: 'badge-orange',
    ADVANCED:     'badge-peach',
};

/* ─── Fun encouragement on completion ───────────────────────── */
const FUN_MESSAGES = [
    "Knowledge loaded! Your brain just got an upgrade. 🧠",
    "Even CEOs watch these. You're in good company! 💼",
    "Your future self is already thanking you. 🙌",
    "That's +30 XP and +100% awesome. Keep going! 🔥",
    "Grammar police approved. Confidence police impressed. 🚔",
];

/* ─── Embedded video data with real YouTube IDs ──────────────── */
const DEMO_VIDEOS = [
    { id: '1', title: "Tell Me About Yourself",       emoji: '🎤', youtubeId: 'MmFupcxA3ys', duration: '4:32',  difficulty: 'BEGINNER',     category: 'Interview Tips', description: "Master this common opener with the Present-Past-Future formula." },
    { id: '2', title: "STAR Method Deep Dive",        emoji: '⭐', youtubeId: 'Iby7lv4YIJU', duration: '6:15',  difficulty: 'INTERMEDIATE', category: 'Interview Tips', description: "Use Situation-Task-Action-Result for powerful answers." },
    { id: '3', title: "Power Poses for Confidence",   emoji: '💪', youtubeId: 'Ks-_Mh1QhMc', duration: '21:02', difficulty: 'BEGINNER',     category: 'Body Language',  description: "Amy Cuddy's TED Talk on how posture changes your mindset and presence." },
    { id: '4', title: "Finding Your Voice",           emoji: '🔊', youtubeId: 'eIho2S0ZahI', duration: '5:30',  difficulty: 'BEGINNER',     category: 'Voice & Tone',   description: "Breathing and resonance exercises for a powerful voice." },
    { id: '5', title: "GD Opening Strategies",        emoji: '🚀', youtubeId: 'HAnw168huqA', duration: '4:20',  difficulty: 'BEGINNER',     category: 'GD Techniques',  description: "Win the crowd from the first sentence." },
    { id: '6', title: "The Pixar Story Formula",      emoji: '🎬', youtubeId: 'ERB7ITvabA4', duration: '5:50',  difficulty: 'BEGINNER',     category: 'Storytelling',   description: "Borrow Pixar's 6-sentence arc for any situation." },
    { id: '7', title: "Eliminating Filler Words",     emoji: '🚫', youtubeId: 'p7OFOhLi4vI', duration: '4:05',  difficulty: 'BEGINNER',     category: 'Voice & Tone',   description: "Replace 'um' and 'uh' with deliberate pauses." },
    { id: '8', title: "Eye Contact Mastery",          emoji: '👁️', youtubeId: '7gKELTnakuM', duration: '3:55',  difficulty: 'BEGINNER',     category: 'Body Language',  description: "Avoid the two extremes: staring vs. darting." },
    { id: '9', title: "GD Interrupting Politely",     emoji: '✋', youtubeId: 'uVRVx_GeQAQ', duration: '3:30',  difficulty: 'INTERMEDIATE', category: 'GD Techniques',  description: "Reclaim the floor without sounding rude." },
    { id: '10', title: "How to Speak So People Listen", emoji: '🗣️', youtubeId: 'eIho2S0ZahI', duration: '9:58', difficulty: 'INTERMEDIATE', category: 'Voice & Tone',  description: "Julian Treasure's masterclass on the fundamentals of powerful speaking." },
    { id: '11', title: "Confident Body Language",     emoji: '🤲', youtubeId: '0O0eNpXig9U', duration: '7:12',  difficulty: 'BEGINNER',     category: 'Body Language',  description: "Simple techniques to project confidence through posture and gestures." },
    { id: '12', title: "Advanced Storytelling",       emoji: '✨', youtubeId: 'w6_54z5FhAE', duration: '11:24', difficulty: 'ADVANCED',     category: 'Storytelling',   description: "Emotional arcs, pacing, and creating memorable speeches." },
];

/* ─── Video Player Modal ─────────────────────────────────────── */
function VideoModal({ video, onClose, onComplete }) {
    const [completed, setCompleted] = useState(false);
    const [msg, setMsg] = useState('');

    const handleComplete = () => {
        if (completed) return;
        setCompleted(true);
        setMsg(FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)]);
        onComplete(video.id);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="card w-full max-w-2xl p-6 space-y-5 animate-slide-up">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`badge ${DIFFICULTY_COLORS[video.difficulty]}`}>{video.difficulty}</span>
                            <span className="text-ink-400 text-xs">{video.category}</span>
                        </div>
                        <h2 className="text-ink-900 font-bold text-lg leading-tight">{video.title}</h2>
                        <p className="text-ink-400 text-sm mt-1">{video.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-ink-400 hover:text-ink-900 text-2xl leading-none flex-shrink-0
                                   w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream-200 transition-all"
                    >×</button>
                </div>

                {/* YouTube embed */}
                <div className="aspect-video rounded-2xl overflow-hidden border-2 border-cream-200 relative bg-cream-100">
                    {video.youtubeId ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <div className="text-7xl">{video.emoji}</div>
                            <p className="text-ink-400 text-sm">⏱ Duration: {video.duration}</p>
                        </div>
                    )}
                </div>

                {/* Mark as watched */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-ink-400 text-xs">Watched the video? Mark it complete to earn XP!</p>
                    <button
                        onClick={handleComplete}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                            ${completed
                                ? 'bg-green-100 text-green-600 border border-green-300 cursor-default'
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                    >
                        {completed ? '✓ Completed — +30 XP' : '✓ Mark as Watched (+30 XP)'}
                    </button>
                </div>

                {/* Fun message on completion */}
                {msg && (
                    <div className="p-3 rounded-2xl bg-mint-100 border-2 border-mint-300 text-mint-500 text-sm text-center font-semibold animate-slide-up">
                        🎉 {msg}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Video Card ─────────────────────────────────────────────── */
function VideoCard({ video, onPlay, isCompleted }) {
    return (
        <button
            onClick={() => onPlay(video)}
            className="card p-0 overflow-hidden text-left
                       transition-all duration-200 hover:shadow-md group w-full"
        >
            {/* Thumbnail area */}
            <div className="h-36 bg-gradient-to-br from-cream-200 to-cream-300 flex items-center
                            justify-center relative overflow-hidden">
                {video.youtubeId ? (
                    <>
                        <img
                            src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-ink-900/20 group-hover:bg-ink-900/10 transition-all duration-300">
                            <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center
                                           group-hover:scale-110 transition-transform duration-300 shadow-card">
                                <svg className="w-5 h-5 text-orange-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </>
                ) : (
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{video.emoji}</span>
                )}
                <div className="absolute bottom-2 right-2 bg-ink-900/70 text-white text-[10px] px-2 py-0.5 rounded-lg font-medium">
                    ⏱ {video.duration}
                </div>
                {isCompleted && (
                    <div className="absolute top-2 left-2 bg-mint-300 text-ink-900 text-[10px]
                        font-bold px-2 py-0.5 rounded-full">✓ Watched</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                    <span className={`badge ${DIFFICULTY_COLORS[video.difficulty]}`}>{video.difficulty}</span>
                    <span className="text-ink-300 text-[10px] font-medium">{video.category}</span>
                </div>
                <p className="text-ink-900 text-sm font-bold leading-tight">{video.title}</p>
                <p className="text-ink-400 text-xs leading-snug line-clamp-2">{video.description}</p>
            </div>
        </button>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function LearningHub() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [completedIds, setCompletedIds] = useState(new Set());

    const videos = activeCategory === 'all'
        ? DEMO_VIDEOS
        : DEMO_VIDEOS.filter(v => v.category === activeCategory);

    const handleComplete = useCallback((videoId) => {
        setCompletedIds(prev => new Set([...prev, videoId]));
        api.post(`/api/learning/videos/${videoId}/complete`).catch(() => {});
    }, []);

    return (
        <div className="layout-root">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="layout-main">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="layout-content">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="page-title">📚 Learning Hub</h2>
                            <p className="page-subtitle mt-1">Watch expert videos, earn XP, and level up your skills.</p>
                        </div>
                        <div className="card px-5 py-3 text-center hidden sm:block">
                            <p className="text-orange-500 font-extrabold text-xl">{completedIds.size}</p>
                            <p className="text-ink-400 text-[10px] font-medium">Watched 👁️</p>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                                    whitespace-nowrap border transition-all duration-200 flex-shrink-0
                                    ${activeCategory === cat.id
                                        ? 'bg-purple-100 border-purple-400 text-purple-600'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-500'
                                    }`}
                            >
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* XP Info Banner */}
                    <div className="card p-4 flex items-center gap-4 border-l-4 border-l-green-400 mb-6">
                        <div className="text-2xl">🎯</div>
                        <div>
                            <p className="text-gray-700 font-semibold text-sm">Earn XP by watching videos!</p>
                            <p className="text-gray-500 text-xs">Each video you mark as watched awards +30 XP. Click any video to watch it.</p>
                        </div>
                        <div className="hidden sm:block ml-auto text-right flex-shrink-0">
                            <p className="text-purple-500 font-bold text-sm">+{videos.length * 30} XP</p>
                            <p className="text-gray-400 text-[10px]">available in this view</p>
                        </div>
                    </div>

                    {/* Video Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map(video => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onPlay={setSelectedVideo}
                                isCompleted={completedIds.has(video.id)}
                            />
                        ))}
                    </div>

                    {videos.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-3">🎬</p>
                            <p className="text-ink-400 text-sm">No videos in this category yet.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal */}
            {selectedVideo && (
                <VideoModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    onComplete={handleComplete}
                />
            )}
        </div>
    );
}
