import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SpeechRecorder from '../components/SpeechRecorder';
import ScoreCard from '../components/ScoreCard';
import { interviewAPI, dashboardAPI } from '../services/api';

const CATEGORIES = [
    { id: 'hr', label: 'HR' },
    { id: 'technical', label: 'Technical' },
    { id: 'behavioral', label: 'Behavioral' },
    { id: 'situational', label: 'Situational' },
];

const FALLBACK = {
    hr: ['Tell me about yourself.', 'Why should we hire you?'],
    technical: ['What is OOP?', 'Explain REST API.'],
    behavioral: ['Tell me about a challenge you faced.'],
    situational: ['How do you handle deadlines?'],
};

function getTodayTaskId() {
    const stored = sessionStorage.getItem('todayTaskId');
    if (stored) return stored;

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay); // 1-based
    const index = dayOfYear % 7;                 // 0-based, matches backend 7 tasks
    return String(index + 1);                    // "1"–"7"
}

export default function InterviewMode() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [category, setCategory] = useState('hr');
    const [questions, setQuestions] = useState([]);
    const [qIndex, setQIndex] = useState(0);

    const [scores, setScores] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [tips, setTips] = useState([]);
    const [fillerCount, setFillerCount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [answered, setAnswered] = useState([]);
    const [lastTranscript, setLastTranscript] = useState('');
    const [warning, setWarning] = useState('');

    /* ── Load Questions ───────────────── */
    useEffect(() => {
        const load = async () => {
            try {
                const res = await interviewAPI.getQuestions(category);
                let loadedQs = [];
                if (Array.isArray(res.data)) {
                    loadedQs = res.data.map(q => q.question);
                } else if (res.data?.questions) {
                    loadedQs = res.data.questions;
                }
                setQuestions(loadedQs.length > 0 ? loadedQs : FALLBACK[category]);
            } catch {
                setQuestions(FALLBACK[category]);
            }
            setQIndex(0);
            setAnswered([]);
            setScores(null);
            setWarning('');
            setLastTranscript('');
        };

        load();
    }, [category]);

    const currentQ = questions[qIndex];

    /* ── Submit Recording ───────────────── */
    const handleRecordingComplete = async (blob, duration, transcript) => {
        if (!blob) return;

        setLoading(true);
        setScores(null);
        setFeedback('');
        setTips([]);
        setFillerCount(null);
        setWarning('');
        setLastTranscript(transcript || '');

        const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;

        try {
            if (wordCount < 5) {
                setWarning(
                    wordCount === 0
                        ? '⚠️ No speech detected. Make sure your microphone is working and you spoke clearly.'
                        : `⚠️ Too short (${wordCount} word${wordCount !== 1 ? 's' : ''} detected). Speak for at least 15–20 seconds for accurate analysis.`
                );
                setLoading(false);
                return;
            }

            const res = await interviewAPI.submitAnswer(qIndex, transcript, duration);
            setScores(res.data?.scores);
            setFeedback(res.data?.feedback || '');
            setTips(res.data?.improvementTips || []);
            setFillerCount(res.data?.fillerWords ?? null);

            setAnswered(prev => [...new Set([...prev, qIndex])]);

            /* ── AUTO-COMPLETE DAILY TASK ── */
            if (duration >= 5) {
                const today = new Date().toISOString().split('T')[0];
                const taskId = getTodayTaskId();
                localStorage.setItem('dailyTask', JSON.stringify({ taskId, date: today }));
                dashboardAPI.completeTask(taskId).catch(console.info);
            }

        } catch (err) {
            const status = err.response?.status;
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;

            console.error('Analysis error — status:', status, '| message:', errMsg, err);

            if (!status) {
                setWarning('⚠️ Cannot reach the server. Is the backend running on port 8080?');
            } else if (status === 401) {
                setWarning('⚠️ Session issue (401). Log out and log back in.');
            } else if (status === 400) {
                setWarning(`⚠️ Bad request: ${errMsg}`);
            } else {
                setWarning(`⚠️ Server error (${status}): ${errMsg || 'Unknown error. Check backend logs.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1">

                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 max-w-6xl mx-auto">

                    <h2 className="text-xl font-bold mb-1">Interview Practice 💼</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Practice answering common interview questions by category.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* LEFT COLUMN - Settings & Recording */}
                        <div className="card space-y-5">
                            
                            {/* Categories */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Category</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {CATEGORIES.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setCategory(c.id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border
                                                ${category === c.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-blue-50'}
                                            `}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question Card */}
                            <div className="border bg-gray-50/50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Question {qIndex + 1}</span>
                                    {answered.includes(qIndex) && <span className="badge badge-green text-xs">✓ Answered</span>}
                                </div>

                                <p className="font-semibold text-gray-800 mb-4 min-h-[3rem]">
                                    {currentQ || 'Loading...'}
                                </p>

                                {/* Nav */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setQIndex(qIndex - 1)}
                                        disabled={qIndex === 0}
                                        className="btn bg-white border text-sm flex-1 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        onClick={() => setQIndex(qIndex + 1)}
                                        disabled={qIndex === questions.length - 1}
                                        className="btn bg-white border text-sm flex-1 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            {/* Recorder */}
                            <div>
                                <h3 className="section-title mb-1">Record Answer</h3>
                                <p className="text-xs text-gray-400 mb-3">Speak clearly for at least 15-20 seconds.</p>
                                <SpeechRecorder
                                    onRecordingComplete={handleRecordingComplete}
                                    maxDuration={120}
                                />
                            </div>

                        </div>

                        {/* RIGHT COLUMN - Analysis & Transcript */}
                        <div className="space-y-4">
                            
                            {/* Warning message */}
                            {warning && (
                                <div className="card border-l-4 border-orange-400 bg-orange-50">
                                    <p className="text-sm text-orange-700">{warning}</p>
                                </div>
                            )}

                            {/* Transcript preview */}
                            {lastTranscript && !loading && !warning && (
                                <div className="card">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                        Your Transcript
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed italic border-l-2 border-gray-200 pl-3">
                                        "{lastTranscript}"
                                    </p>
                                    {fillerCount !== null && (
                                        <p className="text-xs text-orange-500 mt-3">
                                            🔍 {fillerCount} filler word{fillerCount !== 1 ? 's' : ''} detected
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Score Card */}
                            <ScoreCard
                                scores={scores}
                                feedback={feedback}
                                improvementTips={tips}
                                loading={loading}
                            />



                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}