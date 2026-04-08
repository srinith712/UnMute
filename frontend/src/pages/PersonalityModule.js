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

    const handleAnswer = (index, value) => {
        const newAns = [...answers];
        newAns[index] = value;
        setAnswers(newAns);
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
                        <div>
                            {QUESTIONS.map((q, i) => (
                                <div key={i} className="mb-3">
                                    <p>{q}</p>
                                    {[0, 1, 2, 3].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => handleAnswer(i, val)}
                                            className="border px-2 py-1 m-1"
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            ))}

                            <div className="mt-4">
                                <p>Score: {percentage}%</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}