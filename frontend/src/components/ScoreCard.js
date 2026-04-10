import React from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';

/* ── Circle Gauge ───────────────────────── */
function CircleGauge({ value, max = 100, color = '#FF8C42', size = 70 }) {
    const r = (size - 8) / 2;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(Math.max(value / max, 0), 1);
    const offset = circumference * (1 - pct);

    return (
        <svg width={size} height={size}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eee" strokeWidth={6} />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={6}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
            >
                {Math.round(value)}
            </text>
        </svg>
    );
}

/* ── Score Row ───────────────────────── */
function ScoreRow({ label, value, max = 100 }) {
    const pct = Math.min((value / max) * 100, 100);

    return (
        <div>
            <div className="flex justify-between text-xs">
                <span>{label}</span>
                <span>{value}/{max}</span>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div
                    className="h-2 bg-purple-500 rounded"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

/* ── Main Component ───────────────────────── */
export default function ScoreCard({
    scores = null,
    feedback = '',
    improvementTips = [],
    loading = false
}) {

    /* ── Loading ───────────────────────── */
    if (loading) {
        return (
            <div className="p-4 border rounded text-center">
                <p className="text-gray-500">Analyzing your speech...</p>
            </div>
        );
    }

    /* ── Empty state ───────────────────────── */
    if (!scores) {
        return (
            <div className="p-4 border rounded text-center">
                <p className="text-gray-500">
                    Submit your speech to see scores.
                </p>
            </div>
        );
    }

    const dimensions = [
        { label: 'Fluency', value: scores.fluency || 0 },
        { label: 'Grammar', value: scores.grammar || 0 },
        { label: 'Vocabulary', value: scores.vocabulary || 0 },
        { label: 'Pronunciation', value: scores.pronunciation || 0 },
        { label: 'Confidence', value: scores.confidence || 0 },
    ];

    const overall = scores.overall || 0;

    const radarData = dimensions.map(d => ({
        subject: d.label,
        score: d.value,
        fullMark: 100,
    }));

    return (
        <div className="p-4 border rounded space-y-4">

            {/* Header */}
            <div className="flex items-center gap-3">
                <CircleGauge value={overall} />

                <div>
                    <p className="text-sm font-semibold">Overall Score</p>
                    <p className="text-xs text-gray-500">out of 100</p>
                </div>
            </div>

            {/* Radar Chart */}
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <Radar
                            dataKey="score"
                            stroke="#7B61FF"
                            fill="#7B61FF"
                            fillOpacity={0.2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Score Bars */}
            <div className="space-y-2">
                {dimensions.map(d => (
                    <ScoreRow key={d.label} label={d.label} value={d.value} />
                ))}
            </div>

            {/* Feedback */}
            {feedback && (
                <div className="p-3 bg-gray-50 border rounded">
                    <p className="text-xs font-semibold mb-1">Feedback</p>
                    <p className="text-sm text-gray-700">{feedback}</p>
                </div>
            )}

            {/* Tips */}
            {improvementTips.length > 0 && (
                <div>
                    <p className="text-xs font-semibold mb-2">Improvement Tips</p>

                    {improvementTips.map((tip, i) => (
                        <p key={i} className="text-sm text-gray-600 mb-1">
                            {i + 1}. {tip}
                        </p>
                    ))}
                </div>
            )}

        </div>
    );
}