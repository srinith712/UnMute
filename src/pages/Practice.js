import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SpeechRecorder from '../components/SpeechRecorder';
import ScoreCard from '../components/ScoreCard';
import { practiceAPI } from '../services/api';
import { generateDemoAnalysis } from '../services/speechAnalysis';


const TOPICS = [
    { id: 'self-intro',   label: 'Self Introduction', icon: '👤', desc: 'Introduce yourself confidently.' },
    { id: 'storytelling', label: 'Storytelling',       icon: '📖', desc: 'Share a memorable story.' },
    { id: 'opinion',      label: 'Express Opinion',    icon: '💬', desc: 'Voice your views on a topic.' },
    { id: 'debate',       label: 'Debate Topic',       icon: '⚡', desc: 'Argue both sides of an issue.' },
    { id: 'news',         label: 'News Summary',       icon: '📰', desc: 'Summarise a recent news item.' },
    { id: 'freestyle',    label: 'Freestyle',          icon: '🎤', desc: 'Speak freely on any topic.' },
];

export default function Practice() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [scores, setScores] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [improvementTips, setImprovementTips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    /* Load session history */
    useEffect(() => {
        practiceAPI.getHistory()
            .then(res => setHistory(Array.isArray(res.data) ? res.data : []))
            .catch(() => { });
    }, []);

    const handleRecordingComplete = useCallback(async (blob, duration) => {
        if (!blob) return;
        setLoading(true);
        setScores(null);
        setFeedback('');
        setImprovementTips([]);
        try {
            const res = await practiceAPI.uploadAudio(blob, {
                topic: selectedTopic?.id || 'freestyle',
                duration,
            });
            setScores(res.data?.scores || null);
            setFeedback(res.data?.feedback || '');
            setImprovementTips(res.data?.improvementTips || []);
        } catch {
            /* Backend unavailable — use smart demo analysis */
            const topicId = selectedTopic?.id || 'freestyle';
            const expectedSec = topicId === 'freestyle' ? 60 : topicId === 'news' ? 90 : 60;
            const demo = generateDemoAnalysis(duration, topicId, expectedSec);
            setScores(demo.scores);
            setFeedback(demo.feedback);
            setImprovementTips(demo.improvementTips);
        } finally {
            setLoading(false);
        }
    }, [selectedTopic]);


    return (
        <div className="layout-root">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="layout-main">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="layout-content">
                    {/* Header */}
                    <div>
                        <h2 className="page-title">🎙️ Speech Practice</h2>
                        <p className="page-subtitle mt-1">Choose a topic, record your response, and get instant AI feedback.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* Left: topic picker + recorder */}
                        <div className="lg:col-span-3 space-y-5">
                            {/* Topic selection */}
                            <div className="card mb-6">
                                <h3 className="section-title mb-3">🗂️ Choose a Topic</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {TOPICS.map(topic => (
                                        <button
                                            key={topic.id}
                                            onClick={() => setSelectedTopic(topic)}
                                            className={`
                        flex flex-col items-start gap-1 p-3 rounded-xl border text-left
                        transition-all duration-200
                        ${selectedTopic?.id === topic.id
                                                    ? 'bg-purple-100 border-purple-400'
                                                    : 'bg-white border-gray-200 hover:border-purple-300'
                                                }
                      `}
                                        >
                                            <span className="text-xl">{topic.icon}</span>
                                            <span className={`text-xs font-semibold leading-tight ${selectedTopic?.id === topic.id ? 'text-purple-600' : 'text-gray-700'}`}>{topic.label}</span>
                                            <span className="text-gray-400 text-[10px] leading-tight">{topic.desc}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedTopic && (
                                    <div className="mt-4 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200 animate-fade-in">
                                        <p className="text-purple-600 text-xs font-semibold">
                                            {selectedTopic.icon} {selectedTopic.label}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-0.5">{selectedTopic.desc}</p>
                                    </div>
                                )}
                            </div>

                            {/* Recorder */}
                            <div className="card">
                                <h3 className="section-title mb-1">🎤 Record Your Response</h3>
                                <p className="text-gray-500 text-xs mb-3">Max 2 minutes per session</p>
                                <SpeechRecorder
                                    onRecordingComplete={handleRecordingComplete}
                                    maxDuration={120}
                                    disabled={!selectedTopic}
                                />
                                {!selectedTopic && (
                                    <p className="text-center text-gray-400 text-xs mt-2">
                                        👆 Select a topic above to enable recording
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right: ScoreCard + history */}
                        <div className="lg:col-span-2 space-y-5">
                            <ScoreCard scores={scores} feedback={feedback} improvementTips={improvementTips} loading={loading} />

                            {/* Session history */}
                            {history.length > 0 && (
                                <div className="card">
                                    <h3 className="section-title mb-3">📋 Recent Sessions</h3>
                                    <ul className="space-y-3">
                                        {history.slice(0, 5).map((s, i) => (
                                            <li key={i} className="flex items-center justify-between py-2
                                             border-b border-gray-100 last:border-0">
                                                <div>
                                                    <p className="text-gray-700 text-xs font-medium">{s.topic || 'Freestyle'}</p>
                                                    <p className="text-gray-400 text-[10px]">{s.date || 'Recently'}</p>
                                                </div>
                                                <span className="text-green-500 font-bold text-sm">{s.score ?? '—'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
