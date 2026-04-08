package com.unmute.model;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Group Discussion Session Entity
 */
@Entity
@Table(name = "gd_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GDSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false, unique = true)
    private String roomId;

    /* ── Participants ───────────────────── */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "gd_session_users",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private List<User> participants = new ArrayList<>();

    /* ── Status ─────────────────────────── */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SessionStatus status = SessionStatus.WAITING;

    /* ── Rating Range ───────────────────── */
    @Column(name = "min_rating")
    private Integer minRating;

    @Column(name = "max_rating")
    private Integer maxRating;

    /* ── Created Time ───────────────────── */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /* ── Lifecycle Hook ─────────────────── */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /* ── Helper Methods ─────────────────── */
    public void addParticipant(User user) {
        if (user != null && !participants.contains(user)) {
            participants.add(user);
        }
    }

    public void removeParticipant(User user) {
        participants.remove(user);
    }

    /* ── Enum ───────────────────────────── */
    public enum SessionStatus {
        WAITING,
        ACTIVE,
        COMPLETED
    }
}