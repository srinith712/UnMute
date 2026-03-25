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

@RestController
@RequestMapping("/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final SpeechService speechService;

    @GetMapping("/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestions(
            @RequestParam(defaultValue = "hr") String category) {

        List<String> questions = speechService.getInterviewQuestions(category);
        List<Map<String, Object>> result = questions.stream()
                .map(q -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", questions.indexOf(q) + 1);
                    m.put("question", q);
                    m.put("category", category);
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/evaluate", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> evaluateAnswer(
            Authentication auth,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "questionId", required = false, defaultValue = "0") String questionId) {

        SpeechResult result = speechService.analyzeAndSave(
                auth.getName(), audio, "{\"questionId\":\"" + questionId + "\"}");

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("questionId", questionId);
        resp.put("fluencyScore", result.getFluencyScore());
        resp.put("grammarScore", result.getGrammarScore());
        resp.put("confidenceScore", result.getConfidenceScore());
        resp.put("fillerWords", result.getFillerWords());
        resp.put("overallScore", result.getOverallScore());
        resp.put("feedback", generateFeedback(result));
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(Authentication auth) {
        List<SpeechResult> history = speechService.getHistory(auth.getName());
        List<Map<String, Object>> result = history.stream()
                .limit(10)
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", r.getId());
                    m.put("overallScore", r.getOverallScore());
                    m.put("analyzedAt", r.getAnalyzedAt());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    private String generateFeedback(SpeechResult r) {
        if (r.getOverallScore() >= 85) return "Excellent! Your answer was clear and confident.";
        if (r.getOverallScore() >= 70) return "Good job! Work on reducing filler words slightly.";
        if (r.getOverallScore() >= 55) return "Decent attempt. Focus on fluency and grammar.";
        return "Keep practicing! Try to speak more slowly and clearly.";
    }
}
