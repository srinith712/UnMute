package com.unmute.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * JWT Utility Class
 */
@Slf4j
@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    /* ── Signing Key ─────────────────── */
    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT secret key must be at least 32 characters");
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    /* ── Generate Token ─────────────── */
    public String generateToken(String email) {

        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /* ── Extract Email ──────────────── */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /* ── Validate Token ─────────────── */
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String email = extractEmail(token);

            return email.equals(userDetails.getUsername()) &&
                   !isTokenExpired(token);

        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token", e);
            return false;
        }
    }

    /* ── Check Expiry ───────────────── */
    private boolean isTokenExpired(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }

    /* ── Parse Claims (Reusable) ────── */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}