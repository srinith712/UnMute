package com.unmute.controller;

import com.unmute.dto.AuthResponse;
import com.unmute.dto.LoginRequest;
import com.unmute.dto.RegisterRequest;
import com.unmute.model.User;
import com.unmute.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Authentication Controller
 * Handles login, register, and user profile
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "https://unmute-six.vercel.app"
        },
        allowCredentials = "true"
)
public class AuthController {

    private final AuthService authService;

    /* ── Register ───────────────────────────── */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /* ── Login ──────────────────────────────── */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /* ── Get Current User ───────────────────── */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication auth) {

        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Unauthorized"));
        }

        User user = authService.getCurrentUser(auth.getName());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("level", user.getLevel());
        response.put("xp", user.getXp());
        response.put("rating", user.getRating());

        return ResponseEntity.ok(response);
    }

    /* ── Logout ─────────────────────────────── */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT is stateless → just return success
        return ResponseEntity.ok(
                Map.of("message", "Logged out successfully")
        );
    }
}