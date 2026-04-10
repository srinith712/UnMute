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

        // ── Real Streak Tracking ──
        LocalDate today = LocalDate.now();
        LocalDate lastActive = user.getLastActiveDate();
        
        if (lastActive == null) {
            user.setStreakCount(1);
        } else {
            long daysSince = today.toEpochDay() - lastActive.toEpochDay();
            if (daysSince == 1) {
                // Next consecutive day
                user.setStreakCount(user.getStreakCount() != null ? user.getStreakCount() + 1 : 2);
            } else if (daysSince > 1) {
                // Streak broken, reset
                user.setStreakCount(1);
            }
            // If daysSince == 0, they already earned streak today, do nothing.
        }

        user.setLastActiveDate(today);

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

        // For legacy users who just had the column added, streakCount might be 0
        // but if they were active yesterday or today, their streak is at LEAST 1.
        int currentStreak = user.getStreakCount() != null ? user.getStreakCount() : 0;
        return Math.max(currentStreak, 1);
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