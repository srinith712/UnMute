import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SpeechRecorder from '../components/SpeechRecorder';
import ScoreCard from '../components/ScoreCard';
import api from '../services/api';

/* ── Challenges Data ───────────────────────── */
const CHALLENGES = [
    {
        id: 'c1',
        title: '30-sec Elevator Pitch',
        durationSeconds: 30,
        xpReward: 80,
        description: 'Introduce yourself in 30 seconds.'
    },
    {
        id: 'c2',
        title: 'Explain an Object',
        durationSeconds: 60,
        xpReward: 60,
        description: 'Explain any object in simple words.'
    },
    {
        id: 'c3',
        title: 'Debate Topic',
        durationSeconds: 45,
        xpReward: 90,
        description: 'Speak in favor of remote work.'
    },
];

/* ── Timer ───────────────────────── */
function CountdownTimer({ seconds }) {
    const [time, setTime] = useState(seconds);

    useEffect(() => {
        setTime(seconds);

        const timer = setInterval(() => {
            setTime(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);

    return (
        <p className="text-xl font-bold text-center">
            ⏱ {time}s
        </p>
    );
}

/* ── Challenge Card ───────────────────────── */
function ChallengeCard({ challenge, onSelect }) {
    return (
        <div
            onClick={() => onSelect(challenge)}
            className="border rounded p-4 cursor-pointer hover:bg-gray-50"
        >
            <h3 className="font-semibold">{challenge.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
                {challenge.description}
            </p>
            <p className="text-xs text-gray-400 mt-2">
                {challenge.durationSeconds}s • +{challenge.xpReward} XP
            </p>
        </div>
    );
}

/* ── Challenge Arena ───────────────────────── */
function ChallengeArena({ challenge, onBack }) {
    const [scores, setScores] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRecordingComplete = async (blob, duration) => {
        if (!blob) return;

        setLoading(true);

        try {
            const form = new FormData();
            form.append('audio', blob);
            form.append('duration', duration);

            const res = await api.post(`/api/challenges/${challenge.id}`, form);

            const data = res?.data || {};
            setScores(data.scores || null);

        } catch (err) {
            console.error("Error:", err);

            /* Demo fallback */
            setScores({
                overall: 70,
                fluency: 65,
                grammar: 75,
                confidence: 68,
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">

            <button onClick={onBack} className="text-sm text-blue-500">
                ← Back
            </button>

            <h2 className="text-lg font-semibold">{challenge.title}</h2>

            <p className="text-sm text-gray-500">
                Speak clearly and complete within time.
            </p>

            <CountdownTimer seconds={challenge.durationSeconds} />

            <SpeechRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={challenge.durationSeconds}
            />

            <ScoreCard scores={scores} loading={loading} />

        </div>
    );
}

/* ── Main Page ───────────────────────── */
export default function Challenges() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    return (
        <div className="flex">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1">

                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="p-4 space-y-4">

                    {!selected ? (
                        <>
                            <h1 className="text-xl font-bold">Speaking Challenges</h1>

                            <p className="text-gray-500 text-sm">
                                Practice speaking with timed challenges.
                            </p>

                            <div className="grid gap-3">
                                {CHALLENGES.map(c => (
                                    <ChallengeCard
                                        key={c.id}
                                        challenge={c}
                                        onSelect={setSelected}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <ChallengeArena
                            challenge={selected}
                            onBack={() => setSelected(null)}
                        />
                    )}

                </main>
            </div>
        </div>
    );
}