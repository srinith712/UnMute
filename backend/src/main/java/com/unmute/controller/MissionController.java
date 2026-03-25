package com.unmute.controller;

import com.unmute.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final UserService userService;

    private static final List<Map<String, Object>> MISSION_TEMPLATES = List.of(
            Map.of("id", "m1", "title", "Morning Warm-Up 🌅",
                    "description", "Record a 60-second speech on any topic",
                    "type", "practice", "xpReward", 50, "icon", "🎤"),
            Map.of("id", "m2", "title", "Interview Hero 💼",
                    "description", "Answer one HR interview question confidently",
                    "type", "interview", "xpReward", 75, "icon", "⭐"),
            Map.of("id", "m3", "title", "Group Thinker 🤝",
                    "description", "Participate in a group discussion session",
                    "type", "gd", "xpReward", 100, "icon", "👥"),
            Map.of("id", "m4", "title", "Learn Something New 📚",
                    "description", "Watch a learning video from the Learning Hub",
                    "type", "learning", "xpReward", 30, "icon", "🎬"),
            Map.of("id", "m5", "title", "Challenge Accepted 🔥",
                    "description", "Complete any speaking challenge",
                    "type", "challenge", "xpReward", 80, "icon", "🏆")
    );

    @GetMapping("/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyMissions(Authentication auth) {
        // In a real system, track completion per user per day. Here we simulate based on XP.
        int xp = 0;
        try {
            xp = userService.getByEmail(auth.getName()).getXp();
        } catch (Exception ignored) {}

        List<Map<String, Object>> missions = new ArrayList<>();
        for (Map<String, Object> template : MISSION_TEMPLATES) {
            Map<String, Object> mission = new LinkedHashMap<>(template);
            // Simple completion simulation: mark first mission done if user has XP
            String id = (String) template.get("id");
            mission.put("completed", "m1".equals(id) && xp > 0);
            missions.add(mission);
        }
        return ResponseEntity.ok(missions);
    }

    @PostMapping("/{missionId}/complete")
    public ResponseEntity<Map<String, Object>> completeMission(
            Authentication auth,
            @PathVariable String missionId) {

        // Find XP reward for this mission
        int xpReward = MISSION_TEMPLATES.stream()
                .filter(m -> missionId.equals(m.get("id")))
                .map(m -> (Integer) m.get("xpReward"))
                .findFirst().orElse(0);

        if (xpReward > 0) {
            userService.addXp(auth.getName(), xpReward);
        }

        String[] funMessages = {
                "Mission complete! You're on fire! 🔥",
                "Even CEOs started with awkward first steps. You're past that! 💼",
                "Grammar police approve. XP incoming! 🚔",
                "Your confidence is growing louder than your mic. Keep going! 🎤",
                "Achievement unlocked: Communication Legend in the making! 🏆"
        };
        String msg = funMessages[new Random().nextInt(funMessages.length)];

        return ResponseEntity.ok(Map.of(
                "success", true,
                "xpAwarded", xpReward,
                "message", msg
        ));
    }
}
