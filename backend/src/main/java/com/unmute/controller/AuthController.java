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

@CrossOrigin(origins = "https://unmute-six.vercel.app")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication auth) {
        User user = authService.getCurrentUser(auth.getName());
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("userId", user.getId());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("level", user.getLevel());
        resp.put("xp", user.getXp());
        resp.put("rating", user.getRating());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT is stateless – just acknowledge
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
