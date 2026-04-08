package com.unmute.controller;

import com.unmute.model.SpeechResult;
import com.unmute.service.SpeechService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Practice Controller
 * Handles speech practice, topics, and history.
 *
 * Two analysis paths:
 *  1. POST /practice/analyze-text  — transcript string (no auth required, demo-friendly)
 *  2. POST /practice/analyze       — audio blob (requires JWT auth)
 */
@RestController
@RequestMapping("/practice")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://unmute-six.vercel.app"
        }
)
public class PracticeController {

    private final SpeechService speechService;

    /* ── Demo Email (same as DashboardController) ─────────── */
    private static final String DEMO_EMAIL = "demo@unmute.app";

    /* ─────────────────────────────────────────────────────────────
     * POST /practice/analyze-text
     * PRIMARY path — transcript-based NLP, no auth needed for demo.
     * ──────────────────────────────────────────────────────────── */
    @PostMapping("/analyze-text")
    public ResponseEntity<Map<String, Object>> analyzeText(
            Authentication auth,
            @RequestBody Map<String, String> body
    ) {
        String transcript = body.getOrDefault("transcript", "").trim();
        String topic      = body.getOrDefault("topic", "freestyle");

        if (transcript.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Transcript is required"));
        }

        /* Use real user if authenticated, else demo */
        String email = (auth != null && auth.getName() != null)
                ? auth.getName()
                : DEMO_EMAIL;

        SpeechResult result = speechService.analyzeTranscript(email, transcript, topic);

        return ResponseEntity.ok(mapResult(result));
    }

    /* ─────────────────────────────────────────────────────────────
     * POST /practice/analyze
     * LEGACY path — audio blob, requires real JWT.
     * ──────────────────────────────────────────────────────────── */
    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> analyzeAudio(
            Authentication auth,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "metadata", defaultValue = "{}") String metadata
    ) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        SpeechResult result = speechService.analyzeAndSave(
                auth.getName(), audio, metadata
        );

        return ResponseEntity.ok(mapResult(result));
    }

    /* ── Get Topics ─────────────────────────────────────────── */
    @GetMapping("/topics")
    public ResponseEntity<List<String>> getTopics() {
        return ResponseEntity.ok(speechService.getPracticeTopics());
    }

    /* ── Get History ────────────────────────────────────────── */
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(
            Authentication auth
    ) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<SpeechResult> history = speechService.getHistory(auth.getName());

        List<Map<String, Object>> response =
                history.stream()
                        .map(this::mapResult)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /* ── Helper: Map SpeechResult → JSON ───────────────────── */
    private Map<String, Object> mapResult(SpeechResult result) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("id", result.getId());

        /* Scores */
        Map<String, Object> scores = new LinkedHashMap<>();
        scores.put("overall",      result.getOverallScore());
        scores.put("fluency",      result.getFluencyScore());
        scores.put("grammar",      result.getGrammarScore());
        scores.put("vocabulary",   result.getVocabularyScore());
        scores.put("pronunciation", result.getPronunciationScore());
        scores.put("confidence",   result.getConfidenceScore());
        response.put("scores", scores);

        /* Filler info */
        response.put("fillerWords", result.getFillerWords());

        /* Tips (pipe-separated → array) */
        String rawTips = result.getImprovementTips();
        List<String> tips = (rawTips != null && !rawTips.isBlank())
                ? Arrays.asList(rawTips.split("\\|"))
                : List.of();
        response.put("improvementTips", tips);

        /* Short feedback = first tip */
        String feedback = (!tips.isEmpty())
                ? tips.get(0)
                : "Great session! Keep practicing.";
        response.put("feedback", feedback);

        response.put("analyzedAt", result.getAnalyzedAt());

        return response;
    }
}