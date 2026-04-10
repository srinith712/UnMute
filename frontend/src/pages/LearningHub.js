import React, { useState, useEffect } from 'react'; // ✅ FIXED
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { dashboardAPI } from '../services/api';

/* ── Categories ───────────────── */
const CATEGORIES = ['All', 'Interview Tips', 'Body Language', 'Voice & Tone'];

/* ── Videos ───────────────── */
const VIDEOS = [
    { id: '1', title: 'Tell Me About Yourself', youtubeId: 'MmFupcxA3ys', category: 'Interview Tips' },
    { id: '2', title: 'Body Language Basics', youtubeId: 'Ks-_Mh1QhMc', category: 'Body Language' },
    { id: '3', title: 'Improve Your Voice', youtubeId: 'eIho2S0ZahI', category: 'Voice & Tone' },
    { id: '4', title: 'Top Interview Mistakes', youtubeId: 'HG68Ymazo18', category: 'Interview Tips' },
    { id: '5', title: 'Confident Speaking Tips', youtubeId: 'Unzc731iCUY', category: 'Voice & Tone' },
    { id: '6', title: 'Powerful Body Language', youtubeId: '86IUqg1vN6A', category: 'Body Language' }
];

/* ── Video Modal ───────────────── */
function VideoModal({ video, onClose, onComplete }) {

    const [watchTime, setWatchTime] = useState(0);
    const [canComplete, setCanComplete] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setWatchTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (watchTime >= 15) {
            setCanComplete(true);
        }
    }, [watchTime]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[95%] max-w-2xl">

                <h3 className="font-semibold text-lg mb-3">{video.title}</h3>

                <iframe
                    className="w-full h-64 rounded"
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                    title={video.title}
                    allowFullScreen
                />

                <p className="text-xs text-gray-500 mt-2">
                    Watch at least 15 seconds to unlock completion
                </p>

                <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${Math.min((watchTime / 15) * 100, 100)}%` }}
                    />
                </div>

                <div className="flex gap-2 mt-4">

                    <button
                        disabled={!canComplete}
                        onClick={() => onComplete(video.id)}
                        className={`px-4 py-1 rounded text-white
                        ${canComplete ? 'bg-green-500' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        Mark Complete
                    </button>

                    <button
                        onClick={onClose}
                        className="border px-4 py-1 rounded"
                    >
                        Close
                    </button>

                </div>

            </div>
        </div>
    );
}

/* ── Video Card ───────────────── */
function VideoCard({ video, onClick, done }) {
    return (
        <div
            onClick={() => onClick(video)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 cursor-pointer overflow-hidden"
        >
            <div className="relative">
                <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                />

                {done && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✓ Watched
                    </span>
                )}
            </div>

            <div className="p-3">
                <p className="text-sm font-semibold">{video.title}</p>
                <p className="text-xs text-gray-500 mt-1">{video.category}</p>
            </div>
        </div>
    );
}

/* ── Main Page ───────────────── */
export default function LearningHub() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [category, setCategory] = useState('All');
    const [selected, setSelected] = useState(null);
    const [completed, setCompleted] = useState([]);

    const filtered =
        category === 'All'
            ? VIDEOS
            : VIDEOS.filter(v => v.category === category);

    const handleComplete = (id) => {
        if (!completed.includes(id)) {
            setCompleted(prev => [...prev, id]);
        }

        /* ── AUTO-COMPLETE DAILY TASK ── */
        const today = new Date().toISOString().split('T')[0];
        const taskId = sessionStorage.getItem('todayTaskId');
        if (taskId) {
            localStorage.setItem('dailyTask', JSON.stringify({ taskId: String(taskId), date: today }));
            dashboardAPI.completeTask(taskId).catch(console.info);
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1">

                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="p-6 space-y-5">

                    <h2 className="text-2xl font-bold">Learning Hub 🎯</h2>

                    {/* Categories */}
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(c => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`px-4 py-1 rounded-full text-sm transition
                                ${category === c
                                        ? 'bg-blue-500 text-white shadow'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Videos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(v => (
                            <VideoCard
                                key={v.id}
                                video={v}
                                onClick={setSelected}
                                done={completed.includes(v.id)}
                            />
                        ))}
                    </div>

                </main>
            </div>

            {selected && (
                <VideoModal
                    video={selected}
                    onClose={() => setSelected(null)}
                    onComplete={handleComplete}
                />
            )}
        </div>
    );
}