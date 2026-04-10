package com.unmute.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User Entity
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ── Basic Info ───────────────────── */
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    /* ── Progress ─────────────────────── */
    @Column(nullable = false)
    @Builder.Default
    private Integer level = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer xp = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer rating = 1000;

    /**
     * Date of the most recent practice session.
     * Used for real consecutive-day streak calculation.
     * Updated by UserService.addXp() after each session.
     */
    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    /**
     * The current consecutive days the user has been active.
     */
    @Column(name = "streak_count", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer streakCount = 0;

    /* ── Timestamp ────────────────────── */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /* ── Lifecycle ────────────────────── */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}