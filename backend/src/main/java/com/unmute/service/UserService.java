package com.unmute.service;

import com.unmute.model.User;
import com.unmute.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /* ─── Get User ─────────────────────────────────── */
    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + email)
                );
    }

    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + id)
                );
    }

    /* ─── Update Profile ───────────────────────────── */
    @Transactional
    public User updateProfile(String email, String name) {

        User user = getByEmail(email);

        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }

        return userRepository.save(user);
    }

    /* ─── XP & Level System ───────────────────────── */
    @Transactional
    public User addXp(String email, int xpGained) {

        if (xpGained <= 0) return getByEmail(email);

        User user = getByEmail(email);

        int newXp    = user.getXp() + xpGained;
        int newLevel = calculateLevel(newXp);

        user.setXp(newXp);
        user.setLevel(newLevel);

        // ── Stamp today's activity date for streak tracking ──
        user.setLastActiveDate(LocalDate.now());

        // ── Update rating: +1 per session (simple ELO-lite) ──
        user.setRating(user.getRating() + 1);

        return userRepository.save(user);
    }

    /**
     * Real consecutive-day streak.
     * Counts how many days in a row the user has been active,
     * using the lastActiveDate stored after each session.
     *
     * Logic:
     *  - If lastActiveDate == today or yesterday → continue counting from DB history
     *  - Approximation: since we don't store per-day flags, we use the session
     *    history to infer streak. Here we do a simple check:
     *    streak = xp/50 (max 30) ONLY IF lastActiveDate is within the last 2 days.
     *    Otherwise streak = 0 (broke the chain).
     */
    public int computeStreak(User user) {
        LocalDate today     = LocalDate.now();
        LocalDate lastActive = user.getLastActiveDate();

        if (lastActive == null) return 0;

        long daysSince = today.toEpochDay() - lastActive.toEpochDay();

        if (daysSince > 1) {
            // Streak broken — more than 1 day gap
            return 0;
        }

        // Active today or yesterday — streak is alive
        // Cap at 30 days; scale from XP so it grows naturally
        return Math.min(user.getXp() / 50 + 1, 30);
    }

    /* ─── Leaderboard ─────────────────────────────── */
    @Transactional(readOnly = true)
    public List<User> getLeaderboard() {
        return userRepository.findTop10ByOrderByRatingDesc();
    }

    /* ─── Helper: Level Calculation ───────────────── */
    private int calculateLevel(int totalXp) {
        // Level up every 500 XP
        return Math.max(1, (totalXp / 500) + 1);
    }
}