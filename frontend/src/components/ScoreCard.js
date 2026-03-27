import React from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';

/* ── Mini circular gauge ────────────────────────────────────── */
function CircleGauge({ value, max = 100, color = '#FF8C42', size = 72 }) {
    const r = (size - 8) / 2;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(Math.max(value / max, 0), 1);
    const dashOffset = circumference * (1 - pct);
    return (
        <svg width={size} height={size}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EBD8" strokeWidth={6} />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
                fill="#1A1A2E" fontSize="14" fontWeight="700" fontFamily="Poppins, Inter, sans-serif">
                {Math.round(value)}
            </text>
        </svg>
    );
}

/* ── Score row ──────────────────────────────────────────────── */
function ScoreRow({ label, value, max = 100, color }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-ink-500 text-xs font-medium">{label}</span>
                <span className="text-ink-900 text-xs font-bold">{value}/{max}</span>
            </div>
            <div className="xp-bar-track">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

const dimensionColors = [
    '#7B61FF',
    '#22c55e',
    '#f97316',
    '#a855f7',
    '#3b82f6',
];

/**
 * ScoreCard
 * Props:
 *   scores: { overall, fluency, grammar, vocabulary, pronunciation, confidence }
 *   feedback: string
 *   improvementTips: string[]
 *   loading: boolean
 */
export default function ScoreCard({ scores = null, feedback = '', improvementTips = [], loading = false }) {
    if (loading) {
        return (
            <div className="card flex flex-col items-center gap-4 animate-pulse">
                <div className="w-[72px] h-[72px] rounded-full bg-gray-100" />
                <div className="space-y-2 w-full">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-4 rounded-lg bg-gray-100" />)}
                </div>
                <p className="text-gray-500 text-sm">Analysing your speech…</p>
            </div>
        );
    }

    if (!scores) {
        return (
            <div className="card flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">📊</div>
                <p className="text-gray-500 text-sm">Record your speech and submit to see your scores here.</p>
            </div>
        );
    }

    const dimensions = [
        { label: 'Fluency',       value: scores.fluency       ?? scores.fluencyScore       ?? 0 },
        { label: 'Grammar',       value: scores.grammar       ?? scores.grammarScore       ?? 0 },
        { label: 'Vocabulary',    value: scores.vocabulary    ?? scores.vocabularyScore    ?? 0 },
        { label: 'Pronunciation', value: scores.pronunciation ?? scores.pronunciationScore ?? 0 },
        { label: 'Confidence',    value: scores.confidence    ?? scores.confidenceScore    ?? 0 },
    ];

    const overall = scores.overall ?? scores.overallScore ?? 0;
    const overallColor =
        overall >= 80 ? '#7DC090' :
        overall >= 60 ? '#7B61FF' :
        overall >= 40 ? '#FF8C42' : '#FF8070';

    const badge =
        overall >= 85 ? { label: 'Excellent 🏆', cls: 'badge-mint'    } :
        overall >= 70 ? { label: 'Good 👍',       cls: 'badge-purple'  } :
        overall >= 50 ? { label: 'Fair ⚡',        cls: 'badge-orange' } :
                        { label: 'Needs Work 💪',  cls: 'badge-peach'  };

    const radarData = dimensions.map(d => ({
        subject: d.label,
        score: Math.min(Math.round(d.value), 100),
        fullMark: 100,
    }));

    return (
        <div className="card space-y-4 animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-4">
                <CircleGauge value={overall} color={overallColor} />
                <div>
                    <p className="text-gray-500 text-xs mb-1">Overall Score</p>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    <p className="text-gray-400 text-xs mt-1">out of 100</p>
                </div>
            </div>

            {/* ── Radar Chart ─────────────────────────────────── */}
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 5, right: 15, bottom: 5, left: 15 }}>
                        <PolarGrid stroke="#E8DFC8" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#8888A0', fontSize: 10 }}
                        />
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#7B61FF"
                            fill="#7B61FF"
                            fillOpacity={0.18}
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Dimension bars */}
            <div className="space-y-3">
                {dimensions.map((d, i) => (
                    <ScoreRow key={d.label} label={d.label} value={d.value}
                        color={dimensionColors[i]} />
                ))}
            </div>

            {/* AI Feedback */}
            {feedback && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">AI Feedback</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{feedback}</p>
                </div>
            )}

            {/* ── Improvement Tips ─────────────────────────────── */}
            {improvementTips && improvementTips.length > 0 && (
                <div className="space-y-2">
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">💡 Improvement Tips</p>
                    {improvementTips.map((tip, i) => (
                        <div key={i} className="flex gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                            <span className="text-purple-500 text-xs font-bold flex-shrink-0">{i + 1}.</span>
                            <p className="text-gray-600 text-xs leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
