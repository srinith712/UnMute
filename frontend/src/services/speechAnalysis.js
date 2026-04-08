/* speechAnalysis.js */

/* ── Topic Feedback ── */
const TOPIC_FEEDBACK = {
    'self-intro': {
        advice: 'Use Present → Past → Future structure.',
        tips: [
            'Start with current role',
            'Mention key achievement',
            'End with future goals'
        ]
    },
    storytelling: {
        advice: 'Follow beginning → conflict → resolution.',
        tips: [
            'Add emotion',
            'Use clear structure',
            'End with takeaway'
        ]
    },
    opinion: {
        advice: 'Use Point → Reason → Example → Point.',
        tips: [
            'State opinion clearly',
            'Support with examples',
            'Stay confident'
        ]
    },
    freestyle: {
        advice: 'Organize thoughts before speaking.',
        tips: [
            'Use simple structure',
            'Avoid filler words',
            'Speak clearly'
        ]
    }
};

/* ── Main Function ── */
export function generateDemoAnalysis(
    durationSec = 30,
    topicId = 'freestyle',
    expectedSec = 60
) {
    /* Safe topic fallback */
    const template = TOPIC_FEEDBACK[topicId] || TOPIC_FEEDBACK['freestyle'];

    /* Duration factor */
    const ratio = Math.min(durationSec / expectedSec, 1);

    /* Base score (stable) */
    const base = 60 + Math.round(ratio * 25);

    /* Helper */
    const clamp = (n) => Math.max(40, Math.min(100, n));

    const scores = {
        overall: clamp(base),
        fluency: clamp(base + 2),
        grammar: clamp(base - 2),
        vocabulary: clamp(base - 3),
        pronunciation: clamp(base + 1),
        confidence: clamp(base + (ratio > 0.7 ? 5 : -5))
    };

    /* Feedback */
    let feedback = '';

    if (durationSec < expectedSec * 0.4) {
        feedback = `Try to speak longer. ${template.advice}`;
    } else if (durationSec < expectedSec * 0.8) {
        feedback = `Good attempt. ${template.advice}`;
    } else {
        feedback = `Great job! ${template.advice}`;
    }

    /* Encouragement */
    let encouragement = '';

    if (scores.overall >= 80) {
        encouragement = '🔥 Excellent performance!';
    } else if (scores.overall >= 70) {
        encouragement = '👍 Good job!';
    } else {
        encouragement = '💪 Keep practicing!';
    }

    return {
        scores,
        feedback,
        improvementTips: template.tips,
        encouragement
    };
}