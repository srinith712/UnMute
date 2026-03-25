package com.unmute.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.unmute.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Auth response that matches the frontend's expectation:
 *   { token: "...", user: { userId, name, email, level, xp, rating } }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    @JsonIgnoreProperties
    private UserPayload user;

    public static AuthResponse of(String token, User u) {
        return AuthResponse.builder()
                .token(token)
                .user(UserPayload.builder()
                        .userId(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .level(u.getLevel())
                        .xp(u.getXp())
                        .rating(u.getRating())
                        .build())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPayload {
        private Long userId;
        private String name;
        private String email;
        private Integer level;
        private Integer xp;
        private Integer rating;
    }
}
