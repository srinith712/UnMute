package com.unmute.controller;

import com.unmute.service.LearningService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Learning Controller
 * Handles learning videos and completion tracking
 */
@RestController
@RequestMapping("/learning")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://unmute-six.vercel.app"
        }
)
public class LearningController {

    private final LearningService learningService;

    /* ── Get Videos ───────────────────────── */
    @GetMapping("/videos")
    public ResponseEntity<List<Map<String, Object>>> getVideos(
            @RequestParam(value = "category", required = false) String category
    ) {

        List<Map<String, Object>> videos =
                learningService.getVideosByCategory(category);

        return ResponseEntity.ok(videos);
    }

    /* ── Complete Video ───────────────────── */
    @PostMapping("/videos/{videoId}/complete")
    public ResponseEntity<Map<String, Object>> completeVideo(
            Authentication auth,
            @PathVariable String videoId
    ) {

        /* Auth safety */
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        learningService.completeVideo(
                auth.getName(),
                videoId
        );

        Map<String, Object> response = Map.of(
                "success", true,
                "xpAwarded", 30,
                "message", "Great job! +30 XP earned 🎉"
        );

        return ResponseEntity.ok(response);
    }
}