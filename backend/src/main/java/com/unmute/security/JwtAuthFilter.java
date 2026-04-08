package com.unmute.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // 🔥 IMPORTANT: Skip JWT for public endpoints
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = extractToken(request);

            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                String email = jwtUtils.extractEmail(token);

                if (email != null) {
                    UserDetails userDetails =
                            userDetailsService.loadUserByUsername(email);

                    if (jwtUtils.validateToken(token, userDetails)) {

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        auth.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }

        } catch (Exception e) {
            log.error("JWT authentication failed", e);
        }

        filterChain.doFilter(request, response);
    }

    /* ── Public Endpoint Check ───────────────── */
    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/auth") ||
               path.startsWith("/ws") ||
               path.startsWith("/dashboard") ||      // 🔥 FIX
               path.startsWith("/api/dashboard");    // 🔥 FIX
    }

    /* ── Extract Token ───────────────── */
    private String extractToken(HttpServletRequest request) {

        String header = request.getHeader("Authorization");

        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        // WebSocket support
        String paramToken = request.getParameter("token");

        if (StringUtils.hasText(paramToken)) {
            return paramToken;
        }

        return null;
    }
}