package com.unmute.service;

import com.unmute.model.SpeechResult;
import com.unmute.model.User;
import com.unmute.repository.SpeechResultRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechService {

    private final SpeechResultRepository speechResultRepository;
    private final UserService userService;

    /* ─── Filler Words Dictionary ───────────────────────────────── */
    private static final List<String> FILLER_WORDS = List.of(
            "um", "uh", "like", "you know", "basically", "actually",
            "literally", "right", "so", "well", "kind of", "sort of"
    );

    /* ─── Static Data ───────────────────────────────── */
    private static final List<String> PRACTICE_TOPICS = List.of(
            "Introduce yourself in 60 seconds",
            "Describe your greatest strength",
            "Talk about a challenge you overcame",
            "Explain your career goals",
            "Discuss a current tech trend",
            "Describe your ideal work environment",
            "Talk about a project you're proud of",
            "Explain a complex topic in simple terms"
    );

    private static final List<String> INTERVIEW_QUESTIONS_HR = List.of(
            "Tell me about yourself",
            "Why do you want to work here?",
            "What are your strengths and weaknesses?",
            "Where do you see yourself in 5 years?",
            "Describe a challenging situation and how you handled it"
    );

    private static final List<String> INTERVIEW_QUESTIONS_TECH = List.of(
            "Explain object-oriented programming",
            "Difference between REST and GraphQL",
            "How does HashMap work internally?",
            "Explain CAP theorem",
            "What is dependency injection?"
    );

    /* ─── Transcript-Based NLP Analysis (PRIMARY) ──────────────── */

    /**
     * Primary analysis path.
     * @param email       User email (or demo email for unauthenticated users)
     * @param transcript  Raw speech transcript from Web Speech API
     * @param topic       Practice topic (self-intro, interview, etc.)
     * @param durationSec Actual recording duration in seconds (0 if unknown)
     */
    @Transactional
    public SpeechResult analyzeTranscript(
            String email, String transcript, String topic, int durationSec) {

        User user = userService.getByEmail(email);

        String normalized = transcript == null ? "" : transcript.trim().toLowerCase();

        /* ── Word Count ── */
        String[] words = normalized.isEmpty() ? new String[0] : normalized.split("\\s+");
        int wordCount = words.length;

        /* ── Early guard: too short to analyze meaningfully ── */
        if (wordCount < 5) {
            String tips = "Speak more! We need at least 5 words to analyze your speech. "
                    + "Aim for 50–150 words in your response.|"
                    + "Try recording again and speak continuously for at least 15–20 seconds.";

            SpeechResult result = SpeechResult.builder()
                    .user(user)
                    .inputText(transcript)
                    .topic(topic != null ? topic : "freestyle")
                    .wordCount(wordCount)
                    .fluencyScore(20.0)
                    .grammarScore(20.0)
                    .vocabularyScore(20.0)
                    .pronunciationScore(20.0)
                    .confidenceScore(20.0)
                    .fillerWords(0)
                    .overallScore(20.0)
                    .improvementTips(tips)
                    .build();

            speechResultRepository.save(result);
            log.info("Transcript too short: user={} words={}", email, wordCount);
            return result;
        }

        /* ── Filler Word Detection ── */
        int fillerCount = 0;
        for (String filler : FILLER_WORDS) {
            int idx = 0;
            while ((idx = normalized.indexOf(filler, idx)) != -1) {
                boolean before = (idx == 0 || !Character.isLetterOrDigit(normalized.charAt(idx - 1)));
                boolean after  = (idx + filler.length() >= normalized.length()
                        || !Character.isLetterOrDigit(normalized.charAt(idx + filler.length())));
                if (before && after) fillerCount++;
                idx += filler.length();
            }
        }

        /* ── Sentence Count ── */
        String[] sentences = transcript == null ? new String[0] : transcript.split("[.!?]+");
        int sentenceCount = Math.max(1,
                (int) Arrays.stream(sentences).filter(s -> !s.isBlank()).count());

        /*
         * ── Word count factor (0.0 → 1.0) ──
         * Global multiplier — short speeches cannot score artificially high.
         * Factor reaches 1.0 at 50+ words (reasonable minimum for a meaningful response).
         */
        double wordFactor = Math.min(1.0, wordCount / 50.0);

        /*
         * ── Fluency: Real WPM if duration is known, otherwise use word count ──
         * Target: 120–150 wpm is natural conversational pace.
         * If durationSec > 0: compute actual WPM and score it.
         * If durationSec == 0 (unknown): fall back to word count heuristic.
         */
        double rawFluency;
        if (durationSec > 0) {
            double wpm = (wordCount / (double) durationSec) * 60.0;
            rawFluency = scoreFromWpm(wpm);
            log.debug("Real WPM: wordCount={} durationSec={} wpm={}", wordCount, durationSec, wpm);
        } else {
            rawFluency = scoreFromWordCount(wordCount);
        }
        double fluency = clampScore(rawFluency * wordFactor);

        /*
         * ── Speech Clarity Score (stored as grammarScore) ──
         * Measures how filler-free and clean the speech is.
         * Note: This is NOT a full grammar check — it uses filler word ratio
         * as a proxy for speech clarity and verbal discipline.
         * For full grammar checking, integrate LanguageTool (see improvement notes).
         */
        double fillerRatio = (double) fillerCount / wordCount;
        double rawGrammar  = 85.0 - (fillerRatio * 250.0);
        double grammar     = clampScore(rawGrammar * wordFactor);

        /* ── Vocabulary: unique word diversity (Type-Token Ratio) ── */
        double rawVocab = scoreVocabulary(words, wordCount);
        double vocabulary = clampScore(rawVocab * wordFactor);

        /*
         * ── Confidence: Sentence structure complexity ──
         * Measures average words per sentence as a proxy for structured delivery.
         * Higher = more organized, complex sentences (correlated with confidence).
         */
        double avgWordsPerSentence = (double) wordCount / sentenceCount;
        double rawConfidence = 45.0 + (avgWordsPerSentence * 1.8);
        double confidence    = clampScore(rawConfidence * wordFactor);

        /*
         * ── Pronunciation: Text-based estimated score ──
         * No audio processing is performed — this is an approximation based on
         * fluency + clarity. For real pronunciation scoring, integrate
         * OpenAI Whisper or CMU Pronouncing Dictionary.
         */
        double pronunciation = clampScore(((fluency * 0.5) + (grammar * 0.5)) * wordFactor);

        /* ── Overall (weighted) ── */
        double overall = round2(
                fluency       * 0.25 +
                grammar       * 0.20 +
                vocabulary    * 0.15 +
                pronunciation * 0.20 +
                confidence    * 0.20
        );

        /* ── Build Tips ── */
        String tips = buildTranscriptTips(fluency, grammar, vocabulary,
                confidence, fillerCount, wordCount, durationSec, topic);

        SpeechResult result = SpeechResult.builder()
                .user(user)
                .inputText(transcript)
                .topic(topic != null ? topic : "freestyle")
                .wordCount(wordCount)
                .fluencyScore(round2(fluency))
                .grammarScore(round2(grammar))
                .vocabularyScore(round2(vocabulary))
                .pronunciationScore(round2(pronunciation))
                .confidenceScore(round2(confidence))
                .fillerWords(fillerCount)
                .overallScore(overall)
                .improvementTips(tips)
                .build();

        SpeechResult saved = speechResultRepository.save(result);

        int xpGained = (int) (overall / 10);
        userService.addXp(email, xpGained);

        log.info("Transcript analyzed: user={} topic={} words={} wpm={} fillers={} score={}",
                email, topic, wordCount,
                durationSec > 0 ? String.format("%.0f", (wordCount / (double) durationSec) * 60) : "N/A",
                fillerCount, overall);

        return saved;
    }

    /**
     * Convenience overload — used when duration is not known (0 = fallback to word-count heuristic).
     */
    @Transactional
    public SpeechResult analyzeTranscript(String email, String transcript, String topic) {
        return analyzeTranscript(email, transcript, topic, 0);
    }

    /* ─── Audio-Based Analysis (Legacy / Authenticated users) ──── */
    /**
     * @deprecated Audio upload path. Previously returned random scores — now fixed.
     * Routes through the NLP pipeline using metadataJson as a placeholder transcript.
     * For real audio-to-text, integrate OpenAI Whisper or Google Speech-to-Text and
     * pass the resulting transcript to analyzeTranscript().
     */
    @Transactional
    public SpeechResult analyzeAndSave(String email, MultipartFile audio, String metadataJson) {
        // Route through the real NLP pipeline instead of generating random scores.
        // Audio processing (STT) is not yet implemented — the metadata is used as a
        // placeholder. When Whisper is integrated, replace metadataJson with the
        // real transcript extracted from the audio file.
        String placeholder = (metadataJson != null && !metadataJson.isBlank() && !metadataJson.equals("{}"))
                ? metadataJson
                : "Audio session submitted for analysis.";

        log.info("Audio upload path (STT not yet implemented): user={} audioSize={} bytes",
                email, audio != null ? audio.getSize() : 0);

        return analyzeTranscript(email, placeholder, "audio-upload", 0);
    }

    /* ─── Scoring Helpers ──────────────────────────────────────── */

    /**
     * Fluency from actual WPM (words per minute).
     * Used when recording duration is known.
     * Natural conversational English: 120–150 WPM.
     * Fast (may be rushed): 150–180 WPM.
     */
    private double scoreFromWpm(double wpm) {
        if (wpm <= 0)    return 0;
        if (wpm < 60)    return wpm * 0.4;              // too slow → 0–24
        if (wpm < 100)   return 24 + (wpm - 60) * 1.2;  // slow → 24–72
        if (wpm < 130)   return 72 + (wpm - 100) * 0.8; // near target → 72–96
        if (wpm < 160)   return 96 + (wpm - 130) * 0.1; // on target → 96–99
        if (wpm < 200)   return 95 - (wpm - 160) * 0.5; // too fast → penalty
        return 75; // extreme speed penalty
    }

    /**
     * Fluency from word count alone (fallback when duration is unknown).
     * Target: 150 words/min for a 60s session.
     * Score rises gradually; short speeches score low.
     */
    private double scoreFromWordCount(int wordCount) {
        if (wordCount == 0)   return 0;
        if (wordCount < 10)   return wordCount * 3.0;          // 0–30
        if (wordCount < 30)   return 30 + (wordCount - 10) * 1.5;  // 30–60
        if (wordCount < 80)   return 60 + (wordCount - 30) * 0.6;  // 60–90
        if (wordCount < 150)  return 90 + (wordCount - 80) * 0.07; // 90–95
        return 95;
    }

    /**
     * Vocabulary diversity — only meaningful at 10+ words.
     * Uses unique-word ratio, weighted by total word count.
     */
    private double scoreVocabulary(String[] words, int totalWords) {
        if (totalWords < 10) return 30 + totalWords * 2.0; // low base for short text
        long uniqueWords = Arrays.stream(words).distinct().count();
        double ratio = (double) uniqueWords / totalWords;
        // A ratio > 0.7 is good; adjust the scale accordingly
        return clampScore(35 + (ratio * 65));
    }

    private double clampScore(double val) {
        return Math.max(0, Math.min(100, val));
    }

    /* ─── Transcript-Specific Tips ─────────────────────────────── */
    private String buildTranscriptTips(
            double fluency, double grammar, double vocabulary,
            double confidence, int fillerCount, int wordCount,
            int durationSec, String topic
    ) {
        List<String> tips = new ArrayList<>();

        if (wordCount < 30)
            tips.add("Speak more! You used only " + wordCount + " words. Aim for 80–150 words per response.");

        if (fillerCount > 3)
            tips.add("Reduce filler words (" + fillerCount +
                    " detected: 'um', 'uh', 'like'). Use deliberate pauses instead.");

        if (fillerCount == 0 && wordCount >= 30)
            tips.add("Excellent! Zero filler words detected — your speech clarity is great.");

        if (fluency < 55)
            tips.add("Improve fluency: try reading aloud daily. Aim for 120–150 words per minute.");

        /* If we have real duration, give specific WPM feedback */
        if (durationSec > 5) {
            double wpm = (wordCount / (double) durationSec) * 60.0;
            if (wpm < 80)
                tips.add(String.format("Your pace was %.0f words/min — try speaking a bit faster (target: 120–150 wpm).", wpm));
            else if (wpm > 180)
                tips.add(String.format("Your pace was %.0f words/min — slow down a little for better clarity (target: 120–150 wpm).", wpm));
            else
                tips.add(String.format("Good speaking pace: %.0f words/min ✓", wpm));
        }

        if (grammar < 55)
            tips.add("Work on speech clarity: speak in complete sentences and avoid filler-heavy phrases.");

        if (vocabulary < 55)
            tips.add("Expand your vocabulary: try using different words instead of repeating the same ones.");

        if (confidence < 55)
            tips.add("Sound more structured: use longer, well-formed sentences for better confidence scoring.");

        if ("interview".equalsIgnoreCase(topic))
            tips.add("Use the STAR method: Situation, Task, Action, Result.");

        if ("self-intro".equalsIgnoreCase(topic) || "self_intro".equalsIgnoreCase(topic))
            tips.add("Structure: Present role → Key achievement → Future goal.");

        if ("debate".equalsIgnoreCase(topic))
            tips.add("Use connectors: 'However', 'On the other hand', 'In contrast' to sound more persuasive.");

        if ("storytelling".equalsIgnoreCase(topic))
            tips.add("Use vivid language and vary your sentence length to keep the listener engaged.");

        if (tips.isEmpty())
            tips.add("Great performance! Keep practicing for consistency.");

        return String.join("|", tips);
    }

    /* ─── Audio Analysis Tips (Legacy) ─────────────────────────── */
    private String buildImprovementTips(
            double fluency, double grammar, double vocabulary,
            double pronunciation, double confidence, int fillers
    ) {
        List<String> tips = new ArrayList<>();
        if (fluency < 70)      tips.add("Improve fluency: read aloud daily for 5 minutes.");
        if (grammar < 70)      tips.add("Work on grammar consistency and sentence structure.");
        if (vocabulary < 70)   tips.add("Use stronger vocabulary. Learn 3 new words daily.");
        if (pronunciation < 70) tips.add("Practice pronunciation using recordings.");
        if (confidence < 70)   tips.add("Slow down and maintain steady eye contact.");
        if (fillers > 4)       tips.add("Reduce filler words (" + fillers + "). Use pauses instead.");
        if (tips.isEmpty())    tips.add("Excellent performance! Try more advanced topics.");
        return String.join("|", tips);
    }

    /* ─── History ─────────────────────────────────────────────── */
    @Transactional(readOnly = true)
    public List<SpeechResult> getHistory(String email) {
        User user = userService.getByEmail(email);
        return speechResultRepository.findByUserOrderByAnalyzedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<SpeechResult> getRecentHistory(String email, int limit) {
        User user = userService.getByEmail(email);
        return speechResultRepository.findRecentByUser(user, PageRequest.of(0, limit));
    }

    /* ─── Topics & Questions ───────────────────────── */
    public List<String> getPracticeTopics() { return PRACTICE_TOPICS; }

    public List<String> getInterviewQuestions(String category) {
        return "tech".equalsIgnoreCase(category)
                ? INTERVIEW_QUESTIONS_TECH
                : INTERVIEW_QUESTIONS_HR;
    }

    /* ─── Helpers ─────────────────────────────────── */
    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    /* ── Helper: Map SpeechResult → JSON ───────────────────── */
    public Map<String, Object> mapResult(SpeechResult result) {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("id", result.getId());

        /* Topic and word count — stored per session */
        response.put("topic",     result.getTopic() != null ? result.getTopic() : "freestyle");
        response.put("wordCount", result.getWordCount() != null ? result.getWordCount() : 0);

        /* Scores */
        Map<String, Object> scores = new LinkedHashMap<>();
        scores.put("overall",       result.getOverallScore());
        scores.put("fluency",       result.getFluencyScore());
        scores.put("grammar",       result.getGrammarScore());
        scores.put("vocabulary",    result.getVocabularyScore());
        scores.put("pronunciation", result.getPronunciationScore());
        scores.put("confidence",    result.getConfidenceScore());
        response.put("scores", scores);

        /* Filler info */
        response.put("fillerWords", result.getFillerWords());

        /* Tips (pipe-separated → array) */
        String rawTips = result.getImprovementTips();
        if (rawTips != null && !rawTips.isBlank()) {
            response.put("improvementTips", Arrays.asList(rawTips.split("\\|")));
        } else {
            response.put("improvementTips", new ArrayList<>());
        }

        /* Generate formatted reply feedback */
        response.put("feedback", generateFeedbackText(result));

        response.put("analyzedAt", result.getAnalyzedAt());

        return response;
    }

    private String generateFeedbackText(SpeechResult r) {
        double score = r.getOverallScore();
        String topic = r.getTopic() != null ? r.getTopic().toLowerCase() : "";

        if (r.getWordCount() != null && r.getWordCount() < 10) {
            return "This seems too short for a full analysis. Please speak a bit more!";
        }

        if (topic.contains("self-intro") || topic.contains("self_intro")) {
            if (score >= 85) return "Thank you for the introduction! Your background was presented very clearly and confidently. Great first impression.";
            if (score >= 70) return "Thanks for introducing yourself. Good effort, but try to reduce filler words to sound more fluent.";
            if (score >= 55) return "Thank you for the intro. Your structure is okay, but focusing on fluency and clarity will help make a stronger impression.";
            return "Thanks for sharing. For a self-introduction, it's best to speak more slowly and clearly. Keep practicing!";
        } else if (topic.contains("storytelling")) {
            if (score >= 80) return "Great story! Your pacing and delivery kept it very engaging.";
            if (score >= 60) return "Nice story, but pay attention to your pacing and reduce hesitations.";
            return "Keep practicing your storytelling. Use pauses effectively to make it more engaging.";
        } else {
            if (score >= 85) return "Excellent delivery! Your speech was clear and confident.";
            if (score >= 70) return "Good job! Try reducing your filler words for a tighter delivery.";
            if (score >= 55) return "Decent attempt. Focus on improving your fluency and grammar.";
            return "Keep practicing! Take a deep breath and speak slowly and clearly.";
        }
    }
}