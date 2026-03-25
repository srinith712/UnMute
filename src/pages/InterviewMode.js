import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SpeechRecorder from '../components/SpeechRecorder';
import ScoreCard from '../components/ScoreCard';
import { interviewAPI } from '../services/api';
import { generateDemoAnalysis } from '../services/speechAnalysis';


const CATEGORIES = [
    { id: 'hr', label: 'HR Round', icon: '👔', color: 'bg-orange-100/20 text-orange-500' },
    { id: 'technical', label: 'Technical', icon: '💻', color: 'bg-purple-100 text-purple-500' },
    { id: 'behavioral', label: 'Behavioral (STAR)', icon: '⭐', color: 'bg-sky-100 text-sky-500' },
    { id: 'situational', label: 'Situational', icon: '🧩', color: 'bg-mint-400/20 text-mint-500' },
];

const FALLBACK_QUESTIONS = {
    hr: [
        'Tell me about yourself.',
        'What are your greatest strengths and weaknesses?',
        'Where do you see yourself in 5 years?',
        'Why do you want to work here?',
        'Describe a time you overcame a challenge.',
    ],
    technical: [
        'Explain the difference between an array and a linked list.',
        'What is Object-Oriented Programming?',
        'How does garbage collection work?',
        'Explain the concept of RESTful APIs.',
        'What is a database index and why is it useful?',
    ],
    behavioral: [
        'Tell me about a time you demonstrated leadership.',
        'Describe a conflict with a coworker and how you resolved it.',
        'Give an example of a time you failed and what you learned.',
        'Tell me about a time you worked under pressure.',
        'Describe a situation where you had to learn something quickly.',
    ],
    situational: [
        'If you had a disagreement with your manager, what would you do?',
        'How would you handle multiple deadlines at the same time?',
        'What would you do if you discovered a major bug right before launch?',
        'How would you prioritize tasks with limited information?',
        'If a client is very unhappy, how would you handle it?',
    ],
};

export default function InterviewMode() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [category, setCategory] = useState('hr');
    const [questions, setQuestions] = useState([]);
    const [qIndex, setQIndex] = useState(0);
    const [scores, setScores] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [qLoading, setQLoading] = useState(false);
    const [answered, setAnswered] = useState([]);

    /* Load questions for selected category */
    useEffect(() => {
        setQLoading(true);
        setQIndex(0);
        setScores(null);
        setFeedback('');
        setAnswered([]);

        interviewAPI.getQuestions(category)
            .then(res => setQuestions(res.data?.questions || FALLBACK_QUESTIONS[category] || []))
            .catch(() => setQuestions(FALLBACK_QUESTIONS[category] || []))
            .finally(() => setQLoading(false));
    }, [category]);

    const currentQ = questions[qIndex] || '';
    const totalQ = questions.length;
    const progress = totalQ ? ((qIndex + 1) / totalQ) * 100 : 0;

    const handleRecordingComplete = useCallback(async (blob, duration) => {
        setLoading(true);
        setScores(null);
        setFeedback('');
        try {
            const res = await interviewAPI.submitAnswer(qIndex, blob);
            setScores(res.data?.scores || null);
            setFeedback(res.data?.feedback || '');
            setAnswered(p => [...new Set([...p, qIndex])]);
        } catch {
            /* Backend unavailable — use smart demo analysis */
            // Map interview category to a topic ID for relevant feedback
            const topicMap = { hr: 'self-intro', technical: 'opinion', behavioral: 'storytelling', situational: 'debate' };
            const topicId = topicMap[category] || 'opinion';
            const demo = generateDemoAnalysis(duration, topicId, 60);
            setScores(demo.scores);
            setFeedback(demo.feedback);
            setAnswered(p => [...new Set([...p, qIndex])]);
        } finally {
            setLoading(false);
        }
    }, [qIndex, category]);



    const goNext = () => { if (qIndex < totalQ - 1) { setQIndex(p => p + 1); setScores(null); setFeedback(''); } };
    const goPrev = () => { if (qIndex > 0) { setQIndex(p => p - 1); setScores(null); setFeedback(''); } };

    return (
        <div className="layout-root">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                    {/* Header */}
                    <div>
                        <h2 className="page-title">💼 Interview Mode</h2>
                        <p className="page-subtitle mt-1">Practice realistic interview questions and receive AI evaluation.</p>
                    </div>

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                            border transition-all duration-200
                            ${category === cat.id
                                        ? 'bg-purple-100 border-purple-400 text-purple-600'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left: question + recorder */}
                        <div className="lg:col-span-3 space-y-5">
                            {/* Progress */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-500 text-xs">
                                        Question {qIndex + 1} of {totalQ}
                                    </span>
                                    <span className="text-gray-500 text-xs">{answered.length} answered</span>
                                </div>
                                <div className="xp-bar-track mb-4">
                                    <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
                                </div>

                                {/* Question */}
                                {qLoading ? (
                                    <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                                ) : (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 min-h-[80px] flex items-center">
                                        <p className="text-gray-800 text-base font-medium leading-relaxed">
                                            {currentQ || 'Loading question…'}
                                        </p>
                                    </div>
                                )}

                                {/* Nav buttons */}
                                <div className="flex items-center gap-3 mt-4">
                                    <button onClick={goPrev} disabled={qIndex === 0}
                                        className="btn-secondary flex-1 disabled:opacity-30">
                                        ← Previous
                                    </button>
                                    <button onClick={goNext} disabled={qIndex === totalQ - 1}
                                        className="btn-secondary flex-1 disabled:opacity-30">
                                        Next →
                                    </button>
                                </div>
                            </div>

                            {/* Recorder */}
                            <div className="card">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="section-title">🎤 Record Your Answer</h3>
                                    {answered.includes(qIndex) && (
                                        <span className="badge badge-mint text-[10px]">
                                            ✓ Answered
                                        </span>
                                    )}
                                </div>
                                <SpeechRecorder
                                    onRecordingComplete={handleRecordingComplete}
                                    maxDuration={180}
                                />
                            </div>

                            {/* Tips */}
                            <div className="card">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">💡 Interview Tips</p>
                                <ul className="space-y-1.5">
                                    {[
                                        'Use the STAR method: Situation → Task → Action → Result',
                                        'Speak clearly and at a moderate pace',
                                        'Use specific examples from your experience',
                                        'Show enthusiasm and confidence',
                                    ].map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-500 text-xs">
                                            <span className="text-purple-500 mt-0.5">›</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Right: score + question list */}
                        <div className="lg:col-span-2 space-y-5">
                            <ScoreCard scores={scores} feedback={feedback} loading={loading} />

                            {/* Question list */}
                            <div className="card">
                                <h3 className="section-title mb-3">All Questions</h3>
                                <ul className="space-y-1">
                                    {questions.map((q, i) => (
                                        <li key={i}>
                                            <button
                                                onClick={() => { setQIndex(i); setScores(null); setFeedback(''); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2
                                    transition-all duration-200
                                    ${i === qIndex
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${answered.includes(i)
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {answered.includes(i) ? '✓' : i + 1}
                                                </span>
                                                <span className="line-clamp-2">{q}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
