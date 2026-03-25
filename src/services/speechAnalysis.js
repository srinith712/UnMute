/**
 * speechAnalysis.js
 * Client-side demo speech scoring engine.
 * Produces realistic, topic-aware feedback when the backend is unavailable.
 */

/* ─── Per-topic feedback templates ─────────────────────────── */
const TOPIC_FEEDBACK = {
    'self-intro': {
        advice: 'A strong self-introduction follows the Present → Past → Future formula. Mention your current role, a key past achievement, and what excites you about what\'s ahead.',
        tips: [
            'Open with your name and current situation, then pivot to your biggest relevant achievement.',
            'Keep filler words (\"um\", \"uh\") under control — replace them with 1-2 second deliberate pauses.',
            'End with forward energy: tell the listener why you\'re genuinely excited about this opportunity.',
        ],
    },
    storytelling: {
        advice: 'Great storytelling uses the Pixar formula: Once upon a time → Every day → Until one day → Because of that → Until finally → Ever since. Emotion is your hook.',
        tips: [
            'Start in the middle of the action — don\'t begin with backstory.',
            'Use specific sensory details (sights, sounds, feelings) to bring your story to life.',
            'Link your story to a clear takeaway at the end — the \"so what\" moment.',
        ],
    },
    opinion: {
        advice: 'Use the PREP framework: Point → Reason → Example → Point. State your stance clearly, defend it with evidence, and restate it confidently.',
        tips: [
            'Lead with your conclusion — don\'t bury it at the end.',
            'Acknowledge the opposing view briefly to show balanced thinking, then rebut it.',
            'Use concrete statistics or real examples to strengthen your argument.',
        ],
    },
    debate: {
        advice: 'In debate, structure is everything. Open with a bold thesis, offer two strong arguments, anticipate counterarguments, and close with a memorable call to action.',
        tips: [
            'Vary your speaking pace — slow down for key points to add emphasis.',
            'Maintain confident posture and steady eye contact to project authority.',
            'Use transitional phrases like \"More importantly...\" and \"Consider this...\" to guide the listener.',
        ],
    },
    news: {
        advice: 'News summaries demand clarity and objectivity. Use the 5 W\'s: Who, What, When, Where, Why. Lead with the most important information first (the inverted pyramid).',
        tips: [
            'Start with the headline — the single most important fact — before providing detail.',
            'Keep sentences short and punchy; aim for one idea per sentence.',
            'Eliminate opinion language unless clearly signaled as analysis.',
        ],
    },
    freestyle: {
        advice: 'Freestyle speaking tests your ability to organise thoughts quickly. A simple structure: Open Strong → Main Point → Supporting Detail → Close Strong.',
        tips: [
            'Don\'t over-plan — let ideas flow naturally, then loop back to reinforce key points.',
            'Use the rule of three: group ideas in threes for a natural rhythm.',
            'Slow down when you feel lost — a purposeful pause sounds confident, not confused.',
        ],
    },
};

/* Challenge-specific feedback */
const CHALLENGE_FEEDBACK = {
    c1: { /* Elevator Pitch */
        advice: 'Hook → Value Proposition → Differentiator → Call to Action. You have 30 seconds — every word must earn its place.',
        tips: [
            'Open with a problem statement, not a job title.',
            'Quantify your value: \"I helped X by increasing Y by Z%\" is far more memorable than vague claims.',
            'End with a clear next step: \"I\'d love to connect\" or \"Can I share more?\".',
        ],
    },
    c2: { /* Random Object */
        advice: 'The best explainers use analogies. Break the object into its core function and compare it to something the listener already knows.',
        tips: [
            'Start with the purpose before explaining the mechanism.',
            'Use a relatable analogy: \"It works like a...\" resonates more than technical terms.',
            'Invite the listener\'s curiosity: \"Have you ever wondered how...?\".',
        ],
    },
    c3: { /* Quickfire Debate */
        advice: 'In a timed debate, lead immediately with your strongest argument — you don\'t have time to warm up.',
        tips: [
            'Use power words: \"Critically\", \"The evidence overwhelmingly shows\", \"Let me be clear\".',
            'End with an impact statement — something the listener will remember after you stop.',
            'Don\'t apologise for your view — commit to it fully for the duration.',
        ],
    },
    c4: { /* Storytelling */
        advice: 'Creative constraints unlock unexpected creativity. When given random words, find the emotional thread that connects them, then build backwards.',
        tips: [
            'Choose a relatable emotion (urgency, hope, humour) as your story\'s heartbeat.',
            'Introduce the random words naturally — they should feel like plot devices, not intrusions.',
            'Keep the ending punchy and tied directly to your opening image.',
        ],
    },
    c5: { /* Mirror Talk */
        advice: 'TV presence comes from controlled energy. Project confidence without aggression — shoulders back, chin level, deliberate pace.',
        tips: [
            'Smile before you speak — it instantly warms your voice quality.',
            'Speak to one person at a time (the camera), not to an imaginary audience.',
            'Your energy should be 20% higher than in a normal conversation — television flattens enthusiasm.',
        ],
    },
    c6: { /* Opposite Debate */
        advice: 'The best opposite-side arguers steel-man the opposing view — they find the most charitable version of the argument they disagree with.',
        tips: [
            'Don\'t signal discomfort — commit fully; the exercise builds cognitive flexibility.',
            'Find the genuine strengths of the opposing view — they almost always exist.',
            'Close by circling back to the strongest point, not the weakest.',
        ],
    },
};

/* ─── Scoring engine ─────────────────────────────────────────── */

/**
 * Generate realistic demo scores based on duration and topic.
 * @param {number} durationSec  – actual recording duration
 * @param {string} topicId      – topic or challenge id
 * @param {number} expectedSec  – expected/ideal duration
 * @returns {{ scores, feedback, improvementTips, encouragement }}
 */
export function generateDemoAnalysis(durationSec = 30, topicId = 'freestyle', expectedSec = 60) {
    // Duration factor: 0.6 if very short, up to 1.0 if at/above target
    const durRatio = Math.min(durationSec / Math.max(expectedSec * 0.5, 10), 1);

    // Base score randomised realistically (65-88)
    const baseScore = 65 + Math.round(durRatio * 18) + Math.round(Math.random() * 5);

    // Add slight per-dimension variance (±8 points)
    const jitter = () => Math.round((Math.random() - 0.5) * 8);
    const clamp = (n) => Math.min(100, Math.max(40, n));
    const clampSub = (n) => Math.min(10, Math.max(4, n / 10));

    const scores = {
        overall: clamp(baseScore),
        fluency: clampSub(clamp(baseScore + jitter())),
        grammar: clampSub(clamp(baseScore + jitter())),
        vocabulary: clampSub(clamp(baseScore - 5 + jitter())),
        pronunciation: clampSub(clamp(baseScore + jitter())),
        confidence: clampSub(clamp(baseScore + (durationSec >= expectedSec * 0.7 ? 5 : -5) + jitter())),
    };

    // Get topic-specific or default feedback
    const tplKey = topicId?.toLowerCase();
    const template = TOPIC_FEEDBACK[tplKey]
        || CHALLENGE_FEEDBACK[tplKey]
        || TOPIC_FEEDBACK['freestyle'];

    // Build contextual feedback string
    let feedback = '';
    if (durationSec < expectedSec * 0.3) {
        feedback = `Your response was quite brief (${durationSec}s). ${template.advice}`;
    } else if (durationSec < expectedSec * 0.6) {
        feedback = `Good start! You spoke for ${durationSec}s. ${template.advice}`;
    } else {
        feedback = `Solid effort — you used your time well (${durationSec}s). ${template.advice}`;
    }

    // Encouragement lines based on score
    const encouragements = scores.overall >= 80
        ? ['🏆 Outstanding performance! That was genuinely impressive.', '🔥 You nailed it! That\'s top-tier communication right there.']
        : scores.overall >= 70
        ? ['👍 Great job! You\'re building real communication confidence.', '⚡ Strong showing! A few tweaks and you\'ll be unstoppable.']
        : ['💪 Keep at it! Every session makes you measurably better.', '🚀 You\'re on the right track — consistency is the secret weapon.'];
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    return {
        scores,
        feedback,
        improvementTips: template.tips,
        encouragement,
    };
}
