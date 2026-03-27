import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

/* ── Custom tooltip ──────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="card px-3 py-2.5 shadow-card-md text-xs">
            <p className="text-ink-400 mb-1.5 font-semibold">{label}</p>
            {payload.map(p => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-ink-500 capitalize">{p.name}:</span>
                    <span className="text-ink-900 font-bold">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Demo data ───────────────────────────────────────────────── */
const DEMO_DATA = [
    { day: 'Mon', overall: 55, fluency: 48, grammar: 60 },
    { day: 'Tue', overall: 62, fluency: 58, grammar: 65 },
    { day: 'Wed', overall: 58, fluency: 54, grammar: 62 },
    { day: 'Thu', overall: 71, fluency: 68, grammar: 74 },
    { day: 'Fri', overall: 75, fluency: 72, grammar: 78 },
    { day: 'Sat', overall: 80, fluency: 79, grammar: 82 },
    { day: 'Sun', overall: 84, fluency: 83, grammar: 86 },
];

const SERIES = [
    { key: 'overall', name: 'Overall', color: '#7B61FF' },
    { key: 'fluency', name: 'Fluency', color: '#FF8C42' },
    { key: 'grammar', name: 'Grammar', color: '#7DC090' },
];

/**
 * ProgressChart
 * Props:
 *   data    – array of { day, overall, fluency, grammar }
 *   title   – string
 *   loading – boolean
 */
export default function ProgressChart({ data, title = 'Weekly Progress', loading = false }) {
    const chartData = data?.length ? data : DEMO_DATA;

    if (loading) {
        return (
            <div className="card p-5 animate-pulse">
                <div className="h-4 w-36 bg-cream-200 rounded mb-4" />
                <div className="h-48 bg-cream-200 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="card p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="section-title text-base">📈 {title}</h3>
                    <p className="section-sub">Last 7 days · Score out of 100</p>
                </div>
                <div className="flex items-center gap-3">
                    {SERIES.map(s => (
                        <div key={s.key} className="hidden sm:flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                            <span className="text-ink-400 text-[10px] font-medium">{s.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                        {SERIES.map(s => (
                            <linearGradient key={s.key} id={`color-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={s.color} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={s.color} stopOpacity={0}    />
                            </linearGradient>
                        ))}
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E8DFC8"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="day"
                        tick={{ fill: '#AAAABC', fontSize: 11, fontWeight: 500 }}
                        axisLine={false} tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#AAAABC', fontSize: 11 }}
                        axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E8DFC8', strokeWidth: 1 }} />

                    {SERIES.map(s => (
                        <Area
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={s.name}
                            stroke={s.color}
                            strokeWidth={2}
                            fill={`url(#color-${s.key})`}
                            dot={{ fill: s.color, r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: s.color }}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
