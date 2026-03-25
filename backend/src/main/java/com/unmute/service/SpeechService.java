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
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpeechService {

    private final SpeechResultRepository speechResultRepository;
    private final UserService userService;

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
            "What is the difference between REST and GraphQL?",
            "How does a HashMap work internally?",
            "Explain the CAP theorem",
            "What is dependency injection?"
    );

    /**
     * Simulate speech analysis (in a real system, this would call an AI microservice).
     * Returns realistic scores for all 5 dimensions plus improvement tips.
     */
    @Transactional
    public SpeechResult analyzeAndSave(String email, MultipartFile audio, String metadataJson) {
        User user = userService.getByEmail(email);

        // Simulate AI analysis
        Random rng = new Random();
        double fluency       = 60.0 + rng.nextDouble() * 35.0;
        double grammar       = 55.0 + rng.nextDouble() * 40.0;
        double vocabulary    = 55.0 + rng.nextDouble() * 40.0;
        double pronunciation = 50.0 + rng.nextDouble() * 45.0;
        double confidence    = 50.0 + rng.nextDouble() * 45.0;
        int    fillers       = rng.nextInt(8);
        double overall = (fluency * 0.25 + grammar * 0.20 + vocabulary * 0.15
                         + pronunciation * 0.20 + confidence * 0.20);

        String improvementTips = buildImprovementTips(fluency, grammar, vocabulary, pronunciation, confidence, fillers);

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
                .improvementTips(improvementTips)
                .build();

        SpeechResult saved = speechResultRepository.save(result);

        // Award XP based on overall score
        int xpGained = (int) (overall / 10);
        userService.addXp(email, xpGained);

        log.info("Speech analysis saved for user={} overall={}", email, overall);
        return saved;
    }

    private String buildImprovementTips(double fluency, double grammar, double vocabulary,
                                         double pronunciation, double confidence, int fillers) {
        List<String> tips = new ArrayList<>();

        if (fluency < 70)
            tips.add("Practice speaking without long pauses. Read aloud for 5 minutes daily to build fluency.");
        if (grammar < 70)
            tips.add("Review subject-verb agreement and tense consistency. Try the 'slow-and-correct' technique before speeding up.");
        if (vocabulary < 70)
            tips.add("Learn 3 new power words each day. Aim to replace filler phrases with precise vocabulary.");
        if (pronunciation < 70)
            tips.add("Record yourself and compare with native speakers. Focus on word stress patterns and enunciation.");
        if (confidence < 70)
            tips.add("Use the 'power pose' for 2 minutes before speaking. Slow down your speech to project assurance.");
        if (fillers > 4)
            tips.add("You used " + fillers + " filler words. Replace them with a deliberate 1-second pause.");
        if (tips.isEmpty())
            tips.add("Excellent session! Keep challenging yourself with harder topics and longer speaking durations.");

        return String.join("|", tips);
    }

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

    public List<String> getPracticeTopics() {
        return PRACTICE_TOPICS;
    }

    public List<String> getInterviewQuestions(String category) {
        if ("tech".equalsIgnoreCase(category)) {
            return INTERVIEW_QUESTIONS_TECH;
        }
        return INTERVIEW_QUESTIONS_HR;
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
