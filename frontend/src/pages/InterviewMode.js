import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SpeechRecorder from '../components/SpeechRecorder';
import ScoreCard from '../components/ScoreCard';
import { interviewAPI } from '../services/api';
import { generateDemoAnalysis } from '../services/speechAnalysis';

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

export default function InterviewMode() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [category, setCategory] = useState('hr');
    const [questions, setQuestions] = useState([]);
    const [qIndex, setQIndex] = useState(0);

    const [scores, setScores] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [answered, setAnswered] = useState([]);

    /* ── Load Questions ───────────────── */
    useEffect(() => {
        const load = async () => {
            try {
                const res = await interviewAPI.getQuestions(category);
                setQuestions(res.data?.questions || FALLBACK[category]);
            } catch {
                setQuestions(FALLBACK[category]);
            }
            setQIndex(0);
            setAnswered([]);
            setScores(null);
        };

        load();
    }, [category]);

    const currentQ = questions[qIndex];

    /* ── Submit Recording ───────────────── */
    const handleRecordingComplete = async (blob, duration, transcript) => {
        setLoading(true);
        setScores(null);

        try {
            const res = await interviewAPI.submitAnswer(qIndex, transcript, duration);
            setScores(res.data?.scores);
            setFeedback(res.data?.feedback);
            setTips(res.data?.improvementTips || []);
        } catch {
            const demo = generateDemoAnalysis(duration, 'interview', 60);
            setScores(demo.scores);
            setFeedback(demo.feedback);
            setTips(demo.improvementTips || []);
        }

        setAnswered(prev => [...new Set([...prev, qIndex])]);
        setLoading(false);
    };

    return (
        <div className="flex">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1">

                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="p-4 space-y-5">

                    {/* Header */}
                    <h2 className="text-lg font-semibold">Interview Practice</h2>

                    {/* Categories */}
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setCategory(c.id)}
                                className={`px-3 py-1 rounded border
                  ${category === c.id ? 'bg-blue-500 text-white' : 'bg-white'}
                `}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    {/* Question */}
                    <div className="border p-4 rounded">
                        <p className="text-sm text-gray-500 mb-1">
                            Question {qIndex + 1}
                        </p>

                        <p className="font-medium">
                            {currentQ || 'Loading...'}
                        </p>

                        {/* Nav */}
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => setQIndex(qIndex - 1)}
                                disabled={qIndex === 0}
                                className="border px-3 py-1 rounded"
                            >
                                Prev
                            </button>

                            <button
                                onClick={() => setQIndex(qIndex + 1)}
                                disabled={qIndex === questions.length - 1}
                                className="border px-3 py-1 rounded"
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    {/* Recorder */}
                    <SpeechRecorder
                        onRecordingComplete={handleRecordingComplete}
                        maxDuration={120}
                    />

                    <ScoreCard
                        scores={scores}
                        feedback={feedback}
                        improvementTips={tips}
                        loading={loading}
                    />

                    {/* Question List */}
                    <div>
                        <h3 className="text-sm font-semibold mb-2">All Questions</h3>

                        <div className="space-y-1">
                            {questions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setQIndex(i)}
                                    className={`block w-full text-left p-2 rounded text-sm
                    ${i === qIndex ? 'bg-blue-100' : ''}
                  `}
                                >
                                    {answered.includes(i) ? '✓ ' : ''}
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}