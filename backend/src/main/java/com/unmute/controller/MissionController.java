package com.unmute.controller;

import com.unmute.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Mission Controller
 * Handles daily missions and completion
 */
@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://unmute-six.vercel.app"
        }
)
public class MissionController {

    private final UserService userService;

    /* ── Mission Templates ─────────────────── */
    private static final List<Map<String, Object>> MISSION_TEMPLATES = List.of(
            Map.of(
                    "id", "m1",
                    "title", "Morning Warm-Up 🌅",
                    "description", "Record a 60-second speech",
                    "type", "practice",
                    "xpReward", 50,
                    "icon", "🎤"
            ),
            Map.of(
                    "id", "m2",
                    "title", "Interview Hero 💼",
                    "description", "Answer one HR question",
                    "type", "interview",
                    "xpReward", 75,
                    "icon", "⭐"
            ),
            Map.of(
                    "id", "m3",
                    "title", "Group Thinker 🤝",
                    "description", "Join a group discussion",
                    "type", "gd",
                    "xpReward", 100,
                    "icon", "👥"
            ),
            Map.of(
                    "id", "m4",
                    "title", "Learn Something New 📚",
                    "description", "Watch a learning video",
                    "type", "learning",
                    "xpReward", 30,
                    "icon", "🎬"
            ),
            Map.of(
                    "id", "m5",
                    "title", "Challenge Accepted 🔥",
                    "description", "Complete a challenge",
                    "type", "challenge",
                    "xpReward", 80,
                    "icon", "🏆"
            )
    );

    /* ── Get Daily Missions ───────────────── */
    @GetMapping("/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyMissions(
            Authentication auth
    ) {

        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).body(List.of());
        }

        int xp = 0;

        try {
            xp = userService.getByEmail(auth.getName()).getXp();
        } catch (Exception ignored) {
            // fallback to default xp = 0
        }

        List<Map<String, Object>> missions = new ArrayList<>();

        for (Map<String, Object> template : MISSION_TEMPLATES) {

            Map<String, Object> mission = new LinkedHashMap<>(template);

            String id = (String) template.get("id");

            // simple logic: mark first mission complete if user has XP
            mission.put("completed", "m1".equals(id) && xp > 0);

            missions.add(mission);
        }

        return ResponseEntity.ok(missions);
    }

    /* ── Complete Mission ─────────────────── */
    @PostMapping("/{missionId}/complete")
    public ResponseEntity<Map<String, Object>> completeMission(
            Authentication auth,
            @PathVariable String missionId
    ) {

        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        /* Find XP reward */
        int xpReward = MISSION_TEMPLATES.stream()
                .filter(m -> missionId.equals(m.get("id")))
                .map(m -> (Integer) m.get("xpReward"))
                .findFirst()
                .orElse(0);

        /* Add XP */
        if (xpReward > 0) {
            userService.addXp(auth.getName(), xpReward);
        }

        /* Encouragement messages */
        String[] messages = {
                "Great job! Keep going 🔥",
                "You're improving every day 💪",
                "Nice work! XP added 🚀",
                "Consistency is your strength 🎯",
                "Level up! Keep practicing 🏆"
        };

        String message = messages[new Random().nextInt(messages.length)];

        Map<String, Object> response = Map.of(
                "success", true,
                "xpAwarded", xpReward,
                "message", message
        );

        return ResponseEntity.ok(response);
    }
}