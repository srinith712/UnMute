package com.unmute.controller;

import com.unmute.service.SpeechService;
import com.unmute.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final SpeechService speechService;
    private final UserService userService;

    private static final List<Map<String, Object>> CHALLENGES = List.of(
            Map.of("id", "c1", "title", "30-Second Elevator Pitch",
                    "description", "Sell yourself in exactly 30 seconds. Imagine you're in a lift with your dream employer.",
                    "icon", "🛗", "durationSeconds", 30, "category", "Career", "xpReward", 80,
                    "tip", "Start with a hook: 'I help companies do X by doing Y.'"),
            Map.of("id", "c2", "title", "Explain a Random Object",
                    "description", "Pick any object near you and explain how it works to a 5-year-old.",
                    "icon", "🎲", "durationSeconds", 60, "category", "Creativity", "xpReward", 60,
                    "tip", "Use analogies and simple words. No jargon allowed!"),
            Map.of("id", "c3", "title", "Debate Quickfire",
                    "description", "You have 45 seconds to passionately argue FOR remote work. Go!",
                    "icon", "⚡", "durationSeconds", 45, "category", "Debate", "xpReward", 90,
                    "tip", "Open with a bold statement, give 2 reasons, end with a call to action."),
            Map.of("id", "c4", "title", "Storytelling Challenge",
                    "description", "Tell a story using exactly these 3 words: dragon, coffee, deadline.",
                    "icon", "📖", "durationSeconds", 90, "category", "Storytelling", "xpReward", 100,
                    "tip", "Use the Pixar formula: Once upon a time... Until one day... Because of that..."),
            Map.of("id", "c5", "title", "Mirror Talk",
                    "description", "Introduce yourself as if you're on national TV being interviewed.",
                    "icon", "📺", "durationSeconds", 60, "category", "Confidence", "xpReward", 70,
                    "tip", "Stand up, smile, and speak to the camera. Posture is half the battle."),
            Map.of("id", "c6", "title", "The Opposite Debate",
                    "description", "Argue against something you strongly believe in. 30 seconds.",
                    "icon", "🔄", "durationSeconds", 30, "category", "Debate", "xpReward", 85,
                    "tip", "Steel-man the opposing view. Great communicators understand both sides.")
    );

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getChallenges() {
        return ResponseEntity.ok(CHALLENGES);
    }

    @PostMapping(value = "/{challengeId}/submit", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> submitChallenge(
            Authentication auth,
            @PathVariable String challengeId,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "metadata", required = false, defaultValue = "{}") String metadata) {

        // Find XP reward
        int xpReward = CHALLENGES.stream()
                .filter(c -> challengeId.equals(c.get("id")))
                .map(c -> (Integer) c.get("xpReward"))
                .findFirst().orElse(50);

        // Reuse speech analysis
        var result = speechService.analyzeAndSave(auth.getName(), audio, metadata);

        // Extra XP for completing a challenge (on top of the speech XP)
        userService.addXp(auth.getName(), xpReward / 2);

        String[] funMessages = {
                "Nice! Your confidence is louder than your mic. 🎤",
                "Grammar police approve this sentence. 👮",
                "Even CEOs started with awkward interviews. You're levelling up! 🔑",
                "Your voice has entered the room before you. That's a win! 🚀",
                "Well done! You just out-talked most of the country. 📊"
        };
        String encouragement = funMessages[new Random().nextInt(funMessages.length)];

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
