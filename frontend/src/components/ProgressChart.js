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

/* ── Tooltip ───────────────────────── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white border p-2 rounded shadow text-xs">
            <p className="text-gray-500 mb-1">{label}</p>

            {payload.map(p => (
                <div key={p.dataKey} className="flex gap-2">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: p.color }}
                    />
                    <span className="text-gray-600">{p.name}:</span>
                    <span className="font-semibold">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Demo data ───────────────────────── */
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
    { key: 'grammar', name: 'Grammar', color: '#4CAF50' },
];

/* ── Main Component ───────────────────────── */
export default function ProgressChart({
    data,
    title = 'Weekly Progress',
    loading = false,
}) {
    const chartData = data?.length ? data : DEMO_DATA;

    /* ── Loading UI ───────────────────────── */
    if (loading) {
        return (
            <div className="p-4 border rounded">
                <div className="h-4 w-32 bg-gray-200 mb-3 rounded" />
                <div className="h-48 bg-gray-200 rounded" />
            </div>
        );
    }

    return (
        <div className="p-4 border rounded">

            {/* Header */}
            <div className="mb-3">
                <h3 className="font-semibold">📈 {title}</h3>
                <p className="text-xs text-gray-500">
                    Last 7 days (scores out of 100)
                </p>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />

                    <Tooltip content={<CustomTooltip />} />

                    {SERIES.map(s => (
                        <Area
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            name={s.name}
                            stroke={s.color}
                            fill={s.color}
                            fillOpacity={0.2}
                        />
                    ))}

                </AreaChart>
            </ResponsiveContainer>

        </div>
    );
}