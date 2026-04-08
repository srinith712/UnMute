package com.unmute.controller;

import com.unmute.model.User;
import com.unmute.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * User Controller
 * Handles profile and leaderboard
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://unmute-six.vercel.app"
        }
)
public class UserController {

    private final UserService userService;

    /* ── Get Profile ───────────────────── */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            Authentication auth
    ) {

        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        User user = userService.getByEmail(auth.getName());

        return ResponseEntity.ok(mapUser(user));
    }

    /* ── Update Profile ────────────────── */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            Authentication auth,
            @RequestBody Map<String, String> body
    ) {

        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        String name = body.getOrDefault("name", "").trim();

        if (name.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Name cannot be empty"));
        }

        User updatedUser = userService.updateProfile(
                auth.getName(),
                name
        );

        return ResponseEntity.ok(mapUser(updatedUser));
    }

    /* ── Leaderboard ───────────────────── */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {

        List<User> leaders = userService.getLeaderboard();

        List<Map<String, Object>> response = leaders.stream()
                .limit(20)
                .map(user -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("userId", user.getId());
                    entry.put("name", user.getName());
                    entry.put("rating", user.getRating());
                    entry.put("level", user.getLevel());
                    entry.put("xp", user.getXp());
                    return entry;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /* ── Helper: Map User ─────────────── */
    private Map<String, Object> mapUser(User user) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("level", user.getLevel());
        response.put("xp", user.getXp());
        response.put("rating", user.getRating());
        response.put("createdAt", user.getCreatedAt());

        return response;
    }
}