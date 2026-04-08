package com.unmute.controller;

import com.unmute.model.SpeechResult;
import com.unmute.service.SpeechService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Interview Controller
 * Handles interview questions, evaluation, and history
 */
@RestController
@RequestMapping("/interview")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://unmute-six.vercel.app"
        }
)
public class InterviewController {

    private final SpeechService speechService;

    /* ── Get Questions ───────────────────── */
    @GetMapping("/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestions(
            @RequestParam(defaultValue = "hr") String category
    ) {

        List<String> questions = speechService.getInterviewQuestions(category);

        List<Map<String, Object>> response = 
                questions.stream()
                        .map(q -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", questions.indexOf(q) + 1);
                            m.put("question", q);
                            m.put("category", category);
                            return m;
                        })
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /* ── Evaluate Answer ─────────────────── */
    @PostMapping(value = "/evaluate", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> evaluateAnswer(
            Authentication auth,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "questionId", defaultValue = "0") String questionId
    ) {

        /* Auth safety */
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        SpeechResult result = speechService.analyzeAndSave(
                auth.getName(),
                audio,
                "{\"questionId\":\"" + questionId + "\"}"
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("questionId", questionId);
        response.put("overallScore", result.getOverallScore());
        response.put("fluencyScore", result.getFluencyScore());
        response.put("grammarScore", result.getGrammarScore());
        response.put("confidenceScore", result.getConfidenceScore());
        response.put("fillerWords", result.getFillerWords());
        response.put("feedback", generateFeedback(result));

        return ResponseEntity.ok(response);
    }

    /* ── Get History ─────────────────────── */
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(
            Authentication auth
    ) {

        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(List.of());
        }

        List<SpeechResult> history = speechService.getHistory(auth.getName());

        List<Map<String, Object>> response =
                history.stream()
                        .limit(10)
                        .map(r -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", r.getId());
                            m.put("overallScore", r.getOverallScore());
                            m.put("analyzedAt", r.getAnalyzedAt());
                            return m;
                        })
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /* ── Feedback Logic ──────────────────── */
    private String generateFeedback(SpeechResult r) {

        double score = r.getOverallScore();

        if (score >= 85) {
            return "Excellent! Your answer was clear and confident.";
        } else if (score >= 70) {
            return "Good job! Try reducing filler words.";
        } else if (score >= 55) {
            return "Decent attempt. Improve fluency and grammar.";
        } else {
            return "Keep practicing! Speak slowly and clearly.";
        }
    }
}