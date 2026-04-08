package com.unmute.controller;

import com.unmute.service.SpeechService;
import com.unmute.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * Challenge Controller
 * Handles challenge list and submissions
 */
@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://unmute-six.vercel.app"
        }
)
public class ChallengeController {

    private final SpeechService speechService;
    private final UserService userService;

    /* ── Static Challenge Data ───────────────────── */
    private static final List<Map<String, Object>> CHALLENGES = List.of(
            Map.of(
                    "id", "c1",
                    "title", "30-Second Elevator Pitch",
                    "description", "Sell yourself in exactly 30 seconds.",
                    "icon", "🛗",
                    "durationSeconds", 30,
                    "category", "Career",
                    "xpReward", 80,
                    "tip", "Start with a strong hook."
            ),
            Map.of(
                    "id", "c2",
                    "title", "Explain a Random Object",
                    "description", "Explain any object in simple terms.",
                    "icon", "🎲",
                    "durationSeconds", 60,
                    "category", "Creativity",
                    "xpReward", 60,
                    "tip", "Use simple language and examples."
            ),
            Map.of(
                    "id", "c3",
                    "title", "Debate Quickfire",
                    "description", "Speak for remote work in 45 seconds.",
                    "icon", "⚡",
                    "durationSeconds", 45,
                    "category", "Debate",
                    "xpReward", 90,
                    "tip", "Give 2 strong points and conclude."
            ),
            Map.of(
                    "id", "c4",
                    "title", "Storytelling Challenge",
                    "description", "Create a story using given words.",
                    "icon", "📖",
                    "durationSeconds", 90,
                    "category", "Storytelling",
                    "xpReward", 100,
                    "tip", "Follow a clear story structure."
            ),
            Map.of(
                    "id", "c5",
                    "title", "Mirror Talk",
                    "description", "Speak like you're on TV.",
                    "icon", "📺",
                    "durationSeconds", 60,
                    "category", "Confidence",
                    "xpReward", 70,
                    "tip", "Maintain posture and smile."
            ),
            Map.of(
                    "id", "c6",
                    "title", "Opposite Debate",
                    "description", "Argue against your own belief.",
                    "icon", "🔄",
                    "durationSeconds", 30,
                    "category", "Debate",
                    "xpReward", 85,
                    "tip", "Understand both sides."
            )
    );

    /* ── Get All Challenges ───────────────────── */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getChallenges() {
        return ResponseEntity.ok(CHALLENGES);
    }

    /* ── Submit Challenge ─────────────────────── */
    @PostMapping(value = "/{challengeId}/submit", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> submitChallenge(
            Authentication auth,
            @PathVariable String challengeId,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "metadata", required = false, defaultValue = "{}") String metadata
    ) {

        /* Validate user */
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        /* Get XP reward */
        int xpReward = CHALLENGES.stream()
                .filter(c -> challengeId.equals(c.get("id")))
                .map(c -> (Integer) c.get("xpReward"))
                .findFirst()
                .orElse(50);

        /* Analyze speech */
        var result = speechService.analyzeAndSave(
                auth.getName(),
                audio,
                metadata
        );

        /* Add extra XP */
        userService.addXp(auth.getName(), xpReward / 2);

        /* Random encouragement */
        String[] messages = {
                "Nice work! Keep improving. 🚀",
                "Great effort! Confidence is growing. 💪",
                "You're getting better every time. 🔥",
                "Strong communication skills! 👏",
                "Keep going, you're on the right track. 🎯"
        };

        String encouragement = messages[new Random().nextInt(messages.length)];

        /* Build response */
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("scores", Map.of(
                "overall", result.getOverallScore(),
                "fluency", result.getFluencyScore(),
                "grammar", result.getGrammarScore(),
                "vocabulary", result.getVocabularyScore(),
                "pronunciation", result.getPronunciationScore(),
                "confidence", result.getConfidenceScore()
        ));
        response.put("xpAwarded", xpReward);
        response.put("encouragement", encouragement);
        response.put("improvementTips", result.getImprovementTips());

        return ResponseEntity.ok(response);
    }
}