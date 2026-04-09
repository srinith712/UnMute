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
            @RequestParam(value = "questionId", defaultValue = "0") String questionId,
            @RequestParam(value = "transcript", defaultValue = "") String transcript,
            @RequestParam(value = "duration", defaultValue = "0") int duration
    ) {

        /* Use real user if authenticated, else demo */
        String email = (auth != null && auth.getName() != null)
                ? auth.getName()
                : "demo@unmute.app";

        /* Call real NLP analysis using the frontend transcript */
        SpeechResult result = speechService.analyzeTranscript(
                email,
                transcript,
                "interview",
                duration
        );

        Map<String, Object> response = new LinkedHashMap<>(speechService.mapResult(result));
        response.put("questionId", questionId);

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
                            Map<String, Object> m = new LinkedHashMap<>(speechService.mapResult(r));
                            // Override ID if you want, but mapResult already puts it
                            return m;
                        })
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

}