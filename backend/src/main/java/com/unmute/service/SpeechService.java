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

import java.util.*;

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
    @Transactional
    public SpeechResult analyzeTranscript(String email, String transcript, String topic) {

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
         * Acts as a global multiplier so short speeches cannot score high.
         * Factor reaches 1.0 at 50+ words (reasonable minimum for a good response).
         */
        double wordFactor = Math.min(1.0, wordCount / 50.0);

        /* ── Fluency: word count vs expected pace (~150 wpm for 60s = 150 words) ── */
        double rawFluency = scoreFromWordCount(wordCount);
        double fluency    = clampScore(rawFluency * wordFactor);

        /* ── Grammar: filler ratio penalty, also penalized by short speech ── */
        double fillerRatio = (double) fillerCount / wordCount;
        double rawGrammar  = 85.0 - (fillerRatio * 250.0);  // base 85, not 95
        double grammar     = clampScore(rawGrammar * wordFactor);

        /* ── Vocabulary: unique word diversity, requires enough words to be meaningful ── */
        double rawVocab = scoreVocabulary(words, wordCount);
        double vocabulary = clampScore(rawVocab * wordFactor);

        /* ── Confidence: words per sentence, penalized for not speaking enough ── */
        double avgWordsPerSentence = (double) wordCount / sentenceCount;
        double rawConfidence = 45.0 + (avgWordsPerSentence * 1.8);
        double confidence    = clampScore(rawConfidence * wordFactor);

        /* ── Pronunciation: estimated from fluency + grammar (no audio = approximation) ── */
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
                confidence, fillerCount, wordCount, topic);

        SpeechResult result = SpeechResult.builder()
                .user(user)
                .inputText(transcript)
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

        log.info("Transcript analyzed: user={} words={} fillers={} score={}",
                email, wordCount, fillerCount, overall);

        return saved;
    }

    /* ─── Audio-Based Analysis (Legacy / Authenticated users) ──── */
    @Transactional
    public SpeechResult analyzeAndSave(String email, MultipartFile audio, String metadataJson) {

        User user = userService.getByEmail(email);
        Random rng = new Random();

        double fluency       = randomScore(rng, 60, 35);
        double grammar       = randomScore(rng, 55, 40);
        double vocabulary    = randomScore(rng, 55, 40);
        double pronunciation = randomScore(rng, 50, 45);
        double confidence    = randomScore(rng, 50, 45);
        int fillers = rng.nextInt(8);

        double overall = (
                fluency * 0.25 + grammar * 0.20 + vocabulary * 0.15 +
                pronunciation * 0.20 + confidence * 0.20
        );

        String tips = buildImprovementTips(fluency, grammar, vocabulary,
                pronunciation, confidence, fillers);

        SpeechResult result = SpeechResult.builder()
                .user(user)
                .inputText(metadataJson)
                .fluencyScore(round2(fluency))
                .grammarScore(round2(grammar))
                .vocabularyScore(round2(vocabulary))
                .pronunciationScore(round2(pronunciation))
                .confidenceScore(round2(confidence))
                .fillerWords(fillers)
                .overallScore(round2(overall))
                .improvementTips(tips)
                .build();

        SpeechResult saved = speechResultRepository.save(result);
        userService.addXp(email, (int) (overall / 10));

        log.info("Audio analyzed: user={} score={}", email, overall);
        return saved;
    }

    /* ─── Scoring Helpers ──────────────────────────────────────── */

    /**
     * Fluency based on word count.
     * Target: 150 words/min for a 60s session.
     * Score rises gradually; short speeches score low.
     */
    private double scoreFromWordCount(int wordCount) {
        if (wordCount == 0)   return 0;
        if (wordCount < 10)   return wordCount * 3.0;         // 0–30
        if (wordCount < 30)   return 30 + (wordCount - 10) * 1.5; // 30–60
        if (wordCount < 80)   return 60 + (wordCount - 30) * 0.6; // 60–90
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
            double confidence, int fillerCount, int wordCount, String topic
    ) {
        List<String> tips = new ArrayList<>();

        if (wordCount < 30)
            tips.add("Speak more! You used only " + wordCount + " words. Aim for 80–150 words per response.");

        if (fillerCount > 3)
            tips.add("Reduce filler words (" + fillerCount +
                    " detected: 'um', 'uh', 'like'). Use deliberate pauses instead.");

        if (fluency < 55)
            tips.add("Improve fluency: try reading aloud daily. Aim for 120–150 words per minute.");

        if (grammar < 55)
            tips.add("Work on grammar: speak in complete sentences and avoid filler-heavy phrases.");

        if (vocabulary < 55)
            tips.add("Expand your vocabulary diversity — try using different words instead of repeating.");

        if (confidence < 55)
            tips.add("Sound more confident: speak in longer, structured sentences.");

        if ("interview".equalsIgnoreCase(topic))
            tips.add("Use the STAR method: Situation, Task, Action, Result.");

        if ("self-intro".equalsIgnoreCase(topic) || "self_intro".equalsIgnoreCase(topic))
            tips.add("Structure: Present role → Key achievement → Future goal.");

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
    private double randomScore(Random rng, double base, double range) {
        return base + rng.nextDouble() * range;
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}