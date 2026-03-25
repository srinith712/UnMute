package com.unmute.controller;

import com.unmute.model.User;
import com.unmute.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication auth) {
        User user = userService.getByEmail(auth.getName());
        return ResponseEntity.ok(mapUser(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        User updated = userService.updateProfile(auth.getName(), body.get("name"));
        return ResponseEntity.ok(mapUser(updated));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        List<User> leaders = userService.getLeaderboard();
        List<Map<String, Object>> result = leaders.stream()
                .limit(20)
                .map(u -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("userId", u.getId());
                    entry.put("name", u.getName());
                    entry.put("rating", u.getRating());
                    entry.put("level", u.getLevel());
                    entry.put("xp", u.getXp());
                    return entry;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> mapUser(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("level", u.getLevel());
        m.put("xp", u.getXp());
        m.put("rating", u.getRating());
        m.put("createdAt", u.getCreatedAt());
        return m;
    }
}
