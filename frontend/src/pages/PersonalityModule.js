import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

/* DATA */
const POSTURE_TIPS = [
    {
        title: 'Upright Posture',
        points: [
            'Keep spine straight and shoulders relaxed',
            'Avoid slouching',
            'Feet flat on ground',
            'Lean slightly forward'
        ]
    },
    {
        title: 'Eye Contact',
        points: [
            'Maintain eye contact 60-70%',
            'Avoid staring',
            'Look at each person briefly',
            'Stay natural'
        ]
    }
];

const VOICE_TIPS = [
    { title: 'Tone', desc: 'Avoid monotone voice' },
    { title: 'Pace', desc: 'Speak clearly and slowly' },
    { title: 'Volume', desc: 'Speak loud and clear' },
    { title: 'Filler Words', desc: 'Avoid um, uh, like' }
];

const GD_TIPS = [
    'Start discussion confidently',
    'Listen before speaking',
    'Use examples',
    'Respect others opinions'
];

const PERSONALITY_TYPES = [
    { type: 'Analyst', desc: 'Logical and data-driven' },
    { type: 'Diplomat', desc: 'Empathetic and friendly' },
    { type: 'Sentinel', desc: 'Organized and reliable' },
    { type: 'Explorer', desc: 'Creative and energetic' }
];

/* QUIZ */
const QUESTIONS = [
    'Do you maintain eye contact?',
    'Are you confident speaking?',
    'Do you use filler words?',
    'Do you listen carefully?'
];

export default function PersonalityModule() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tab, setTab] = useState('posture');
    const [answers, setAnswers] = useState([]);
    const [qIndex, setQIndex] = useState(0);

    const handleAnswer = (index, value) => {
        const newAns = [...answers];
        newAns[index] = value;
        setAnswers(newAns);
        
        if (index < QUESTIONS.length - 1) {
            setQIndex(index + 1);
        }
    };

    const score = answers.reduce((a, b) => a + (b || 0), 0);
    const percentage = Math.round((score / (QUESTIONS.length * 3)) * 100);

    return (
        <div className="flex">

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4">

                    <h2 className="text-xl font-bold mb-4">Personality Module</h2>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                        {['posture', 'voice', 'gd', 'types', 'quiz'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-3 py-1 border rounded ${tab === t ? 'bg-blue-500 text-white' : ''
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT */}

                    {tab === 'posture' && (
                        <div>
                            {POSTURE_TIPS.map((tip, i) => (
                                <div key={i} className="border p-3 mb-2 rounded">
                                    <h4 className="font-semibold">{tip.title}</h4>
                                    <ul className="list-disc ml-5 text-sm">
                                        {tip.points.map((p, j) => <li key={j}>{p}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'voice' && (
                        <div>
                            {VOICE_TIPS.map((tip, i) => (
                                <div key={i} className="border p-3 mb-2 rounded">
                                    <h4 className="font-semibold">{tip.title}</h4>
                                    <p className="text-sm">{tip.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'gd' && (
                        <ul className="list-disc ml-5">
                            {GD_TIPS.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    )}

                    {tab === 'types' && (
                        <div>
                            {PERSONALITY_TYPES.map((p, i) => (
                                <div key={i} className="border p-3 mb-2 rounded">
                                    <h4 className="font-semibold">{p.type}</h4>
                                    <p className="text-sm">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'quiz' && (
                        <div className="max-w-xl border rounded p-6 bg-white shadow-sm">
                            <p className="text-sm text-gray-500 mb-2">Question {qIndex + 1} of {QUESTIONS.length}</p>
                            <h3 className="text-xl font-medium mb-6">{QUESTIONS[qIndex]}</h3>
                            
                            <div className="flex gap-2">
                                {[0, 1, 2, 3].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => handleAnswer(qIndex, val)}
                                        className={`flex-1 border px-2 py-3 rounded text-lg font-medium hover:bg-blue-50 transition-colors
                                            ${answers[qIndex] === val ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-50 text-gray-700'}`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex justify-between mt-8">
                                <button 
                                    onClick={() => setQIndex(prev => Math.max(0, prev - 1))}
                                    disabled={qIndex === 0}
                                    className="px-4 py-2 border rounded disabled:opacity-50 text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium"
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={() => setQIndex(prev => Math.min(QUESTIONS.length - 1, prev + 1))}
                                    disabled={qIndex === QUESTIONS.length - 1}
                                    className="px-4 py-2 border rounded disabled:opacity-50 text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium"
                                >
                                    Next
                                </button>
                            </div>

                            {answers.filter(a => a !== undefined).length === QUESTIONS.length && (
                                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                    <p className="text-lg font-bold text-green-800">Quiz Completed!</p>
                                    <p className="text-2xl mt-2 font-medium text-gray-800">Score: {percentage}%</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}