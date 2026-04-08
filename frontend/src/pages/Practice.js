import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SpeechRecorder from '../components/SpeechRecorder';
import ScoreCard from '../components/ScoreCard';
import { practiceAPI } from '../services/api';

/* ── Topics ───────────────────────── */
const TOPICS = [
    { id: 'self-intro',   label: 'Self Introduction' },
    { id: 'storytelling', label: 'Storytelling' },
    { id: 'opinion',      label: 'Opinion' },
    { id: 'debate',       label: 'Debate' },
    { id: 'news',         label: 'News Summary' },
    { id: 'freestyle',    label: 'Freestyle' },
];

/**
 * Derive today's task ID using the SAME rotation as the backend:
 *   dayOfYear % 8  → 0-based index → task IDs are "1"–"8"
 * This ensures localStorage always stores the correct task ID.
 */
function getTodayTaskId() {
    const now  = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff  = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay); // 1-based
    const index = dayOfYear % 8;                 // 0-based, matches backend
    return String(index + 1);                    // "1"–"8"
}

export default function Practice() {

    const [sidebarOpen, setSidebarOpen]   = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [scores, setScores]             = useState(null);
    const [feedback, setFeedback]         = useState('');
    const [tips, setTips]                 = useState([]);
    const [fillerCount, setFillerCount]   = useState(null);
    const [loading, setLoading]           = useState(false);
    const [history, setHistory]           = useState([]);
    const [lastTranscript, setLastTranscript] = useState('');
    const [warning, setWarning]               = useState('');

    /* ── Load History ───────────────────────── */
    useEffect(() => {
        practiceAPI.getHistory()
            .then(res => setHistory(res.data || []))
            .catch(() => {});
    }, []);

    /* ── Handle Recording Complete ───────────────────────── */
    const handleRecordingComplete = async (blob, duration, transcript) => {

        if (!blob) return;

        setLoading(true);
        setScores(null);
        setFeedback('');
        setTips([]);
        setFillerCount(null);
        setWarning('');
        setLastTranscript(transcript || '');

        const topicId = selectedTopic?.id || 'freestyle';

        const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;

        try {
            /* ── Guard: too little speech ── */
            if (wordCount < 5) {
                setWarning(
                    wordCount === 0
                        ? '⚠️ No speech detected. Make sure your microphone is working and you spoke clearly.'
                        : `⚠️ Too short (${wordCount} word${wordCount !== 1 ? 's' : ''} detected). Speak for at least 15–20 seconds for accurate analysis.`
                );
                return; // finally still runs — setLoading(false) is there
            }

            /* ── PRIMARY: transcript-based NLP ── */
            const res = await practiceAPI.analyzeTranscript(transcript, topicId);

            setScores(res.data?.scores);
            setFeedback(res.data?.feedback || '');
            setTips(res.data?.improvementTips || []);
            setFillerCount(res.data?.fillerWords ?? null);

        } catch (err) {
            /* Show the actual error for easier debugging */
            const status  = err.response?.status;
            const errMsg  = err.response?.data?.error || err.response?.data?.message || err.message;

            console.error('Analysis error — status:', status, '| message:', errMsg, err);

            if (!status) {
                // True network error (CORS, backend down, no response)
                setWarning('⚠️ Cannot reach the server. Is the backend running on port 8080?');
            } else if (status === 401) {
                setWarning('⚠️ Session issue (401). Log out and log back in.');
            } else if (status === 400) {
                setWarning(`⚠️ Bad request: ${errMsg}`);
            } else {
                // 500 or other — show actual server error
                setWarning(`⚠️ Server error (${status}): ${errMsg || 'Unknown error. Check backend logs.'}`);
            }

        } finally {
            setLoading(false);

            /* ── AUTO-COMPLETE DAILY TASK ── */
            if (duration >= 30) {
                const today      = new Date().toISOString().split('T')[0];
                const taskId     = getTodayTaskId();

                localStorage.setItem('dailyTask', JSON.stringify({
                    taskId,
                    date: today,
                }));

                console.log(`✅ Daily task auto-completed: taskId=${taskId}, date=${today}`);
            }
        }
    };

    return (
        <div className="flex">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1">

                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 max-w-6xl mx-auto">

                    <h2 className="text-xl font-bold mb-1">Speech Practice 🎤</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Select a topic, record your speech, and get instant AI feedback.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* LEFT — Record */}
                        <div className="card">

                            <h3 className="section-title mb-3">1. Choose a Topic</h3>

                            <div className="grid grid-cols-2 gap-2 mb-5">
                                {TOPICS.map(t => (
                                    <button
                                        key={t.id}
                                        id={`topic-${t.id}`}
                                        onClick={() => setSelectedTopic(t)}
                                        className={`border p-2 rounded-lg text-sm font-medium transition-all duration-150
                                            ${selectedTopic?.id === t.id
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <h3 className="section-title mb-1">2. Record</h3>
                            <p className="text-xs text-gray-400 mb-3">
                                Speak clearly for at least 30 seconds to complete today's task.
                            </p>

                            <SpeechRecorder
                                onRecordingComplete={handleRecordingComplete}
                                maxDuration={120}
                                disabled={!selectedTopic}
                            />

                        </div>

                        {/* RIGHT — Results */}
                        <div className="space-y-4">

                            {/* Warning message */}
                            {warning && (
                                <div className="card border-l-4 border-orange-400 bg-orange-50">
                                    <p className="text-sm text-orange-700">{warning}</p>
                                </div>
                            )}

                            {/* Transcript preview (shown after recording) */}
                            {lastTranscript && !loading && !warning && (
                                <div className="card">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                        Your Transcript
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {lastTranscript}
                                    </p>
                                    {fillerCount !== null && (
                                        <p className="text-xs text-orange-500 mt-2">
                                            🔍 {fillerCount} filler word{fillerCount !== 1 ? 's' : ''} detected
                                        </p>
                                    )}
                                </div>
                            )}

                            <ScoreCard
                                scores={scores}
                                feedback={feedback}
                                improvementTips={tips}
                                loading={loading}
                            />

                            {/* History */}
                            {history.length > 0 && (
                                <div className="card">
                                    <h3 className="section-title mb-3">Recent Sessions</h3>
                                    <ul className="space-y-2">
                                        {history.slice(0, 5).map((h, i) => (
                                            <li
                                                key={h.id || i}
                                                className="flex justify-between items-center border-b pb-2 last:border-0"
                                            >
                                                <span className="text-sm text-gray-600">
                                                    {h.topic || 'Freestyle'}
                                                </span>
                                                <span className="badge badge-purple">
                                                    {h.scores?.overall
                                                        ? `${Math.round(h.scores.overall)}/100`
                                                        : h.score || '-'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}