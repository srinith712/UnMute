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
@RequestMapping("/practice")
@RequiredArgsConstructor
public class PracticeController {

    private final SpeechService speechService;

    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> analyzeAudio(
            Authentication auth,
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "metadata", required = false, defaultValue = "{}") String metadata) {

        SpeechResult result = speechService.analyzeAndSave(auth.getName(), audio, metadata);
        return ResponseEntity.ok(mapResult(result));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> getTopics() {
        return ResponseEntity.ok(speechService.getPracticeTopics());
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(Authentication auth) {
        List<SpeechResult> history = speechService.getHistory(auth.getName());
        List<Map<String, Object>> result = history.stream()
                .map(this::mapResult)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> mapResult(SpeechResult r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        // scores sub-object for easier frontend consumption
        Map<String, Object> scores = new LinkedHashMap<>();
        scores.put("overall", r.getOverallScore());
        scores.put("fluency", r.getFluencyScore());
        scores.put("grammar", r.getGrammarScore());
        scores.put("vocabulary", r.getVocabularyScore());
        scores.put("pronunciation", r.getPronunciationScore());
        scores.put("confidence", r.getConfidenceScore());
        m.put("scores", scores);
        m.put("fillerWords", r.getFillerWords());
        // Split pipe-delimited tips into a proper list
        String raw = r.getImprovementTips();
        m.put("improvementTips", (raw != null && !raw.isBlank())
                ? java.util.Arrays.asList(raw.split("\\|"))
                : java.util.List.of());
        m.put("feedback", raw != null && !raw.isBlank()
                ? raw.split("\\|")[0]   // first tip as short feedback string
                : "Great session! Keep practising.");
        m.put("analyzedAt", r.getAnalyzedAt());
        return m;
    }
}
