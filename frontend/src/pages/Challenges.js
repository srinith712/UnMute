import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SpeechRecorder from '../components/SpeechRecorder';
import ScoreCard from '../components/ScoreCard';
import api from '../services/api';
import { generateDemoAnalysis } from '../services/speechAnalysis';


const CHALLENGES = [
    {
        id: 'c1', title: '30-Second Elevator Pitch', icon: '🛗', durationSeconds: 30,
        category: 'Career', xpReward: 80, description: 'Sell yourself in exactly 30 seconds. Imagine you\'re in a lift with your dream employer.',
        tip: 'Start with a hook: "I help companies do X by doing Y."'
    },
    {
        id: 'c2', title: 'Explain a Random Object', icon: '🎲', durationSeconds: 60,
        category: 'Creativity', xpReward: 60, description: 'Pick any object near you and explain how it works to a 5-year-old.',
        tip: 'Use analogies and simple words. No jargon allowed!'
    },
    {
        id: 'c3', title: 'Debate Quickfire', icon: '⚡', durationSeconds: 45,
        category: 'Debate', xpReward: 90, description: 'You have 45 seconds to passionately argue FOR remote work. Go!',
        tip: 'Open with a bold statement, give 2 reasons, end with a call to action.'
    },
    {
        id: 'c4', title: 'Storytelling Challenge', icon: '📖', durationSeconds: 90,
        category: 'Storytelling', xpReward: 100, description: 'Tell a story using exactly these 3 words: dragon, coffee, deadline.',
        tip: 'Use the Pixar formula: Once upon a time… Until one day… Because of that…'
    },
    {
        id: 'c5', title: 'Mirror Talk', icon: '📺', durationSeconds: 60,
        category: 'Confidence', xpReward: 70, description: 'Introduce yourself as if you\'re on national TV being interviewed.',
        tip: 'Stand up, smile, and speak to the camera. Posture is half the battle.'
    },
    {
        id: 'c6', title: 'The Opposite Debate', icon: '🔄', durationSeconds: 30,
        category: 'Debate', xpReward: 85, description: 'Argue against something you strongly believe in. 30 seconds.',
        tip: 'Steel-man the opposing view. Great communicators understand both sides.'
    },
];

const CATEGORY_COLORS = {
    Career:      'badge-sky',
    Creativity:  'badge-lavender',
    Debate:      'badge-peach',
    Storytelling:'badge-orange',
    Confidence:  'badge-mint',
};

const FUN_MESSAGES = [
    "Nice! Your confidence is louder than your mic. 🎤",
    "Grammar police approve this performance. 👮",
    "Even CEOs started with an awkward first pitch. You're past that! 🔑",
    "Your voice has entered the room before you. That's a win! 🚀",
    "Achievement unlocked: Communication Legend in the making! 🏆",
];

/* ─── Countdown Timer ────────────────────────────────────────── */
function CountdownTimer({ seconds, onExpire }) {
    const [remaining, setRemaining] = useState(seconds);
    const [started, setStarted] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!started) return;
        intervalRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    onExpire?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [started, onExpire]);

    const pct = ((seconds - remaining) / seconds) * 100;
    const ring = 2 * Math.PI * 40;
    const color = remaining < 5 ? '#FF8070' : remaining < seconds * 0.4 ? '#FF8C42' : '#7DC090';

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#F0EBD8" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="8"
                        strokeLinecap="round" strokeDasharray={ring}
                        strokeDashoffset={ring * (1 - pct / 100)}
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-ink-900 font-extrabold text-3xl">{remaining}</span>
                    <span className="text-ink-400 text-[10px] font-medium">sec</span>
                </div>
            </div>
            {!started && remaining === seconds && (
                <button
                    onClick={() => setStarted(true)}
                    className="btn-primary animate-glow"
                >
                    ▶ Start Timer
                </button>
            )}
        </div>
    );
}

/* ─── Challenge Card ─────────────────────────────────────────── */
function ChallengeCard({ challenge, onSelect }) {
    return (
        <button
            onClick={() => onSelect(challenge)}
            className="card hover:shadow-md transition p-5 text-left space-y-3 w-full cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <span className="text-3xl">
                    {challenge.icon}
                </span>
                <div className="text-right space-y-1">
                    <span className={`badge ${CATEGORY_COLORS[challenge.category] || 'badge-purple'}`}>
                        {challenge.category}
                    </span>
                    <p className="text-green-500 font-bold text-xs">+{challenge.xpReward} XP</p>
                </div>
            </div>
            <div>
                <p className="text-gray-800 font-semibold text-sm leading-tight">{challenge.title}</p>
                <p className="text-gray-500 text-xs mt-1 leading-snug">{challenge.description}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
                <span>⏱ {challenge.durationSeconds}s</span>
                <span className="ml-auto text-purple-500 font-semibold">Start →</span>
            </div>
        </button>
    );
}

/* ─── Active Challenge Arena ─────────────────────────────────── */
function ChallengeArena({ challenge, onBack }) {
    const [scores, setScores] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [encouragement, setEncouragement] = useState('');

    const handleRecordingComplete = async (blob, duration) => {
        if (!blob) return;
        setLoading(true);
        setScores(null);
        try {
            const form = new FormData();
            form.append('audio', blob, 'challenge.webm');
            form.append('metadata', JSON.stringify({ challengeId: challenge.id, duration }));
            const res = await api.post(`/api/challenges/${challenge.id}/submit`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setScores(res.data?.scores || null);
            setFeedback(res.data?.scores ? 'Your challenge is scored! Check the radar below.' : '');
            setTips(res.data?.improvementTips
                ? (typeof res.data.improvementTips === 'string'
                    ? res.data.improvementTips.split('|')
                    : res.data.improvementTips)
                : []);
            setEncouragement(res.data?.encouragement || FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)]);
        } catch {
            const demo = generateDemoAnalysis(duration, challenge.id, challenge.durationSeconds);
            setScores(demo.scores);
            setFeedback(demo.feedback);
            setTips(demo.improvementTips);
            setEncouragement(demo.encouragement);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 animate-slide-up">
            <button onClick={onBack} className="text-ink-400 hover:text-ink-900 text-sm flex items-center gap-1 transition-colors font-medium">
                ← Back to Challenges
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Timer + Recorder */}
                <div className="space-y-4">
                    <div className="card p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{challenge.icon}</span>
                            <div>
                                <h3 className="text-ink-900 font-bold">{challenge.title}</h3>
                                <span className={`badge ${CATEGORY_COLORS[challenge.category] || 'badge-purple'}`}>
                                    {challenge.category}
                                </span>
                            </div>
                        </div>
                        <p className="text-ink-500 text-sm">{challenge.description}</p>
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <p className="text-blue-600 text-xs font-medium">💡 Tip: {challenge.tip}</p>
                        </div>
                    </div>

                    <div className="card p-6 flex flex-col items-center gap-4">
                        <p className="text-ink-400 text-sm font-medium">Your time limit</p>
                        <CountdownTimer seconds={challenge.durationSeconds} />
                    </div>

                    <div className="card p-5">
                        <h4 className="section-title mb-3">🎤 Record Your Response</h4>
                        <SpeechRecorder
                            onRecordingComplete={handleRecordingComplete}
                            maxDuration={challenge.durationSeconds + 10}
                        />
                    </div>
                </div>

                {/* Right: ScoreCard */}
                <div className="space-y-4">
                    <ScoreCard scores={scores} feedback={feedback} improvementTips={tips} loading={loading} />
                    {encouragement && scores && (
                        <div className="card p-5 text-center animate-slide-up">
                            <p className="text-2xl mb-2">🎉</p>
                            <p className="text-ink-900 font-bold text-sm">{encouragement}</p>
                            <p className="text-mint-500 text-xs mt-1 font-semibold">+{challenge.xpReward} XP earned!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function Challenges() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    return (
        <div className="layout-root">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="layout-main">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="layout-content">
                    {!selected ? (
                        <>
                            {/* Header */}
                            <div>
                                <h2 className="page-title">🏆 Speaking Challenges</h2>
                                <p className="page-subtitle mt-1">
                                    Quick, high-intensity speaking drills. Timer on. Mic ready. Let's go!
                                </p>
                            </div>

                            {/* Banner */}
                            <div className="card p-4 flex items-center gap-4 border-l-4 border-l-orange-400 mb-6">
                                <div className="text-2xl">⚡</div>
                                <div>
                                    <p className="text-gray-700 font-semibold text-sm">How it works</p>
                                    <p className="text-gray-500 text-xs">
                                        Pick a challenge → read the prompt → hit Start Timer → speak when ready →
                                        submit your recording for instant AI-powered scoring.
                                    </p>
                                </div>
                            </div>

                            {/* Challenge Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {CHALLENGES.map(c => (
                                    <ChallengeCard key={c.id} challenge={c} onSelect={setSelected} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <ChallengeArena challenge={selected} onBack={() => setSelected(null)} />
                    )}
                </main>
            </div>
        </div>
    );
}
