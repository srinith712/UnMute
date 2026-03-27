import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

/* ─── Data ─────────────────────────────────────────────────── */
const POSTURE_TIPS = [
    {
        icon: '🧍',
        title: 'Upright Posture',
        color: 'from-primary-600/20 to-primary-800/10 border-purple-200',
        badge: { label: 'Body Language', color: 'bg-purple-100 text-purple-500 border-primary-500/30' },
        points: [
            'Sit or stand with spine straight, shoulders relaxed.',
            'Avoid slouching — it signals low confidence.',
            'Feet flat on the floor, evenly balanced.',
            'Lean forward slightly to show engagement.',
        ],
    },
    {
        icon: '👁️',
        title: 'Eye Contact',
        color: 'from-accent-600/20 to-accent-800/10 border-accent-500/20',
        badge: { label: 'Confidence', color: 'bg-sky-100 text-sky-500 border-accent-500/30' },
        points: [
            "Maintain natural eye contact 60-70% of the time.",
            "Break gaze naturally — dont stare.",
            "Look at each person in a group for 2-3 seconds.",
            "Looking up-left = recalling; up-right = imagining.",
        ],
    },
    {
        icon: '🤲',
        title: 'Gestures & Hands',
        color: 'from-neon-green/20 to-neon-blue/10 border-mint-300/20',
        badge: { label: 'Expression', color: 'bg-mint-400/20 text-mint-500 border-mint-300/30' },
        points: [
            'Open palms convey honesty and openness.',
            'Use gestures to emphasize key points.',
            'Avoid crossing arms — signals defensiveness.',
            'Keep hands visible, not in pockets.',
        ],
    },
    {
        icon: '😊',
        title: 'Facial Expression',
        color: 'from-neon-yellow/20 to-neon-pink/10 border-orange-300/20',
        badge: { label: 'Warmth', color: 'bg-orange-100/20 text-orange-500 border-orange-300/30' },
        points: [
            "Smile genuinely — it's contagious and disarming.",
            "Mirror emotions to show empathy.",
            "Nod occasionally to signal active listening.",
            "Raised eyebrows can signal interest or disbelief.",
        ],
    },
];

const VOICE_TIPS = [
    { icon: '🎵', title: 'Tone & Pitch', desc: 'Vary your pitch to avoid a monotone delivery. Drop your pitch at the end of statements to sound authoritative; raise it for questions.' },
    { icon: '🐢', title: 'Pace & Pausing', desc: 'Speak at ~130 words/min. Strategic pauses of 2–3 seconds add emphasis and give listeners time to absorb ideas.' },
    { icon: '🔊', title: 'Volume', desc: 'Project from the diaphragm, not the throat. Fill the room naturally. Lowering volume at key moments creates intrigue.' },
    { icon: '✂️', title: 'Filler Words', desc: 'Eliminate "um", "uh", "like", "you know". Replace with silence — it sounds far more confident.' },
    { icon: '🗣️', title: 'Articulation', desc: 'Slow down slightly and enunciate clearly. Open your mouth more than feels natural.' },
    { icon: '❤️', title: 'Authenticity', desc: 'The most compelling communicators are genuine. Let personality come through — vulnerability builds trust.' },
];
const GD_STRATEGIES = [
    {
        num: "01",
        title: "Initiate the Discussion",
        tip: "Starting earns attention. Keep it structured: define the topic, then invite opinions."
    },
    {
        num: "02",
        title: "Listen Actively",
        tip: "Acknowledge others' points before countering. Say: \"That's an interesting view because...\""
    },
    {
        num: "03",
        title: "Use the PREP Framework",
        tip: "Point → Reason → Example → Point. Structured ideas are more persuasive."
    },
    {
        num: "04",
        title: "Build on Others' Ideas",
        tip: "Say: \"Building on what [Name] said...\" to show collaborative intelligence."
    }
];

const PERSONALITY_TYPES = [
    {
        type: 'The Analyst',
        emoji: '🔍',
        desc: 'Logical, data-driven, precise. Great at breaking down complex ideas. Growth area: Show more empathy and warmth in communication.',
        color: 'border-primary-500/30 bg-primary-600/5',
    },
    {
        type: 'The Diplomat',
        emoji: '🤝',
        desc: 'Empathetic, collaborative, people-focused. Excellent at building rapport. Growth area: Be more assertive when sharing opinions.',
        color: 'border-mint-300/30 bg-mint-400/5',
    },
    {
        type: 'The Sentinel',
        emoji: '🛡️',
        desc: 'Organised, reliable, detail-oriented. Trusted voice in a group. Growth area: Embrace ambiguity and adapt quickly to changes.',
        color: 'border-orange-300/30 bg-orange-100/5',
    },
    {
        type: 'The Explorer',
        emoji: '🚀',
        desc: 'Creative, spontaneous, energetic. Generates exciting ideas. Growth area: Follow through and communicate plans more clearly.',
        color: 'border-peach-300/30 bg-peach-100/5',
    },
];

/* ─── Card: posture ─────────────────────────────────────────── */
function PostureCard({ tip }) {
    return (
        <div className={`card p-5 bg-gradient-to-br ${tip.color} border`}>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{tip.icon}</span>
                <div>
                    <h4 className="text-ink-900 font-semibold text-sm">{tip.title}</h4>
                    <span className={`badge border text-[10px] mt-0.5 ${tip.badge.color}`}>{tip.badge.label}</span>
                </div>
            </div>
            <ul className="space-y-1.5">
                {tip.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-ink-600 text-xs leading-relaxed">
                        <span className="text-purple-500 mt-0.5 flex-shrink-0">›</span>
                        {p}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ─── Self-assessment quiz ──────────────────────────────────── */
const QUIZ_Q = [
    { q: 'How often do you make eye contact during conversations?', opts: ['Rarely', 'Sometimes', 'Often', 'Always'] },
    { q: 'How confident are you in expressing opinions in a group?', opts: ['Not at all', 'Slightly', 'Quite', 'Very confident'] },
    { q: 'Do you use filler words (um, uh, like)?', opts: ['Always', 'Often', 'Rarely', 'Never'] },
    { q: 'How well do you listen before responding?', opts: ['Rarely', 'Sometimes', 'Usually', 'Always'] },
];

function SelfAssessment() {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmit] = useState(false);

    const handleAnswer = (qi, oi) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qi]: oi }));
    };

    const allAnswered = Object.keys(answers).length === QUIZ_Q.length;
    const score = Object.values(answers).reduce((a, v) => a + v, 0);
    const maxScore = (QUIZ_Q.length - 1) * 3;
    const pct = Math.round((score / maxScore) * 100);

    const resultLabel =
        pct >= 80 ? { label: 'Communication Pro 🏆', color: 'text-mint-500' } :
            pct >= 60 ? { label: 'Solid Communicator 👍', color: 'text-purple-500' } :
                pct >= 40 ? { label: 'Developing Skills ⚡', color: 'text-orange-500' } :
                    { label: 'Needs Improvement 💪', color: 'text-peach-500' };

    return (
        <div className="card p-5">
            <h3 className="section-title text-base mb-1">🧪 Quick Self-Assessment</h3>
            <p className="section-subtitle text-xs mb-4">Rate your current communication style</p>

            <div className="space-y-5">
                {QUIZ_Q.map((item, qi) => (
                    <div key={qi}>
                        <p className="text-ink-700 text-sm mb-2">
                            <span className="text-purple-500 font-semibold mr-1">{qi + 1}.</span>{item.q}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {item.opts.map((opt, oi) => (
                                <button
                                    key={oi}
                                    onClick={() => handleAnswer(qi, oi)}
                                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-200 ${answers[qi] === oi
                                        ? 'bg-primary-600/30 border-primary-500/60 text-purple-400'
                                        : 'bg-cream-100 border-cream-200 text-ink-500 hover:border-white/20 hover:text-ink-700'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {allAnswered && !submitted && (
                <button onClick={() => setSubmit(true)} className="btn-primary mt-5 w-full">
                    See My Results →
                </button>
            )}

            {submitted && (
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-primary-600/10 to-accent-600/10
                        border border-cream-200 text-center animate-fadeIn">
                    <p className="text-ink-400 text-xs mb-1">Your Communication Score</p>
                    <p className={`text-3xl font-bold mb-1 ${resultLabel.color}`}>{pct}%</p>
                    <p className={`font-semibold text-sm ${resultLabel.color}`}>{resultLabel.label}</p>
                    <p className="text-ink-400 text-xs mt-2">
                        Keep practicing with UnMute's daily exercises to improve!
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function PersonalityModule() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('posture');

    const TABS = [
        { id: 'posture', label: 'Body Language', icon: '🧍' },
        { id: 'voice', label: 'Voice & Tone', icon: '🎵' },
        { id: 'gd', label: 'GD Strategies', icon: '💬' },
        { id: 'types', label: 'Personality Types', icon: '🧠' },
        { id: 'quiz', label: 'Self-Assessment', icon: '🧪' },
    ];

    return (
        <div className="layout-root">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                    {/* Header */}
                    <div className="relative card p-6 overflow-hidden">
                        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="font-display font-bold text-2xl text-ink-900">Personality Module</h2>
                            <p className="text-ink-400 text-sm mt-1 max-w-xl">
                                Master the art of communication through body language, voice modulation,
                                and structured discussion strategies.
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                            border transition-all duration-200
                            ${activeTab === tab.id
                                        ? 'bg-purple-100 text-purple-500 border-primary-500/40'
                                        : 'bg-cream-100 text-ink-500 border-cream-200 hover:border-white/20'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {activeTab === 'posture' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                            {POSTURE_TIPS.map(tip => <PostureCard key={tip.title} tip={tip} />)}
                        </div>
                    )}

                    {activeTab === 'voice' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                            {VOICE_TIPS.map(tip => (
                                <div key={tip.title} className="card p-5 hover:scale-[1.02] transition-transform">
                                    <span className="text-3xl block mb-3">{tip.icon}</span>
                                    <h4 className="text-ink-900 font-semibold text-sm mb-2">{tip.title}</h4>
                                    <p className="text-ink-500 text-xs leading-relaxed">{tip.desc}</p>
                                </div>
                            ))}
                            {/* Practice prompt */}
                            <div className="card p-5 col-span-full bg-gradient-to-r from-primary-600/10 to-accent-600/10
                              border-purple-200 flex flex-col sm:flex-row items-center gap-4">
                                <span className="text-5xl">🎙️</span>
                                <div>
                                    <h4 className="text-ink-900 font-semibold text-sm mb-1">Voice Warm-Up Exercise</h4>
                                    <p className="text-ink-500 text-xs leading-relaxed">
                                        Read aloud for 5 minutes daily. Try tongue twisters, poems, and speeches.
                                        Record yourself with the <strong className="text-purple-500">Practice</strong> module
                                        and track your voice improvement over time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gd' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {GD_STRATEGIES.map(s => (
                                    <div key={s.num} className="card p-5">
                                        <span className="text-purple-500 font-bold text-lg">{s.num}</span>
                                        <h4 className="text-ink-900 font-semibold text-sm mt-1 mb-2">{s.title}</h4>
                                        <p className="text-ink-500 text-xs leading-relaxed">{s.tip}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Dos and Don'ts */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="card p-5 border-mint-300/20 bg-mint-400/5">
                                    <h4 className="text-mint-500 font-semibold text-sm mb-3">✅ Do's in GD</h4>
                                    <ul className="space-y-1.5">
                                        {['Speak clearly and concisely', 'Listen attentively', 'Bring in relevant examples', 'Maintain calm even in disagreements', 'Give credit to others\' points'].map((d, i) => (
                                            <li key={i} className="text-ink-600 text-xs flex items-start gap-2">
                                                <span className="text-mint-500 mt-0.5">✓</span>{d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="card p-5 border-peach-300/20 bg-peach-100/5">
                                    <h4 className="text-peach-500 font-semibold text-sm mb-3">❌ Don'ts in GD</h4>
                                    <ul className="space-y-1.5">
                                        {['Interrupt others mid-sentence', 'Use aggressive or dismissive language', 'Go off-topic or ramble', 'Remain silent throughout', 'Repeat the same point multiple times'].map((d, i) => (
                                            <li key={i} className="text-ink-600 text-xs flex items-start gap-2">
                                                <span className="text-peach-500 mt-0.5">✗</span>{d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'types' && (
                        <div className="space-y-4 animate-fadeIn">
                            <p className="text-ink-400 text-sm">
                                Understanding your personality type helps you communicate more effectively.
                                Each type has innate strengths — and growth areas.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PERSONALITY_TYPES.map(pt => (
                                    <div key={pt.type} className={`card p-5 border ${pt.color}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-4xl">{pt.emoji}</span>
                                            <h4 className="text-ink-900 font-bold text-base">{pt.type}</h4>
                                        </div>
                                        <p className="text-ink-600 text-xs leading-relaxed">{pt.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="card p-5 bg-purple-50 border-purple-200">
                                <p className="text-purple-500 font-semibold text-sm mb-1">💡 Pro Tip</p>
                                <p className="text-ink-500 text-xs leading-relaxed">
                                    No type is better than another. Elite communicators adapt their style to their audience.
                                    Practice switching between assertive (Analyst) and empathetic (Diplomat) modes
                                    depending on the context.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="max-w-2xl animate-fadeIn">
                            <SelfAssessment />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
