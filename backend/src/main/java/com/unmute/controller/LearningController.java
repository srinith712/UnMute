package com.unmute.controller;

import com.unmute.service.LearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning")
@RequiredArgsConstructor
public class LearningController {

    private final LearningService learningService;

    @GetMapping("/videos")
    public ResponseEntity<List<Map<String, Object>>> getVideos(
            @RequestParam(value = "category", required = false) String category) {
        return ResponseEntity.ok(learningService.getVideosByCategory(category));
    }

    @PostMapping("/videos/{videoId}/complete")
    public ResponseEntity<Map<String, Object>> completeVideo(
            Authentication auth,
            @PathVariable String videoId) {
        learningService.completeVideo(auth.getName(), videoId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "xpAwarded", 30,
                "message", "Nice! Your curiosity is your superpower. +30 XP! 🎉"
        ));
    }
}
