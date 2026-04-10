package com.unmute.repository;

import com.unmute.model.SpeechResult;
import com.unmute.model.User;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Speech Results
 */
@Repository
public interface SpeechResultRepository extends JpaRepository<SpeechResult, Long> {

    /* ── User History ─────────────────── */
    List<SpeechResult> findByUserOrderByAnalyzedAtDesc(User user);

    /* ── Count Results ────────────────── */
    @Query("SELECT COUNT(s) FROM SpeechResult s WHERE s.user = :user")
    long countByUser(@Param("user") User user);

    /* ── Average Score ───────────────── */
    @Query("SELECT AVG(s.overallScore) FROM SpeechResult s WHERE s.user = :user")
    Double avgOverallScoreByUser(@Param("user") User user);

    /* ── Recent Results (Paginated) ───── */
    @Query("""
           SELECT s FROM SpeechResult s
           WHERE s.user = :user
           ORDER BY s.analyzedAt DESC
           """)
    List<SpeechResult> findRecentByUser(
            @Param("user") User user,
            Pageable pageable
    );

    /* ── Date Range Results ───────────── */
    @Query("SELECT s FROM SpeechResult s WHERE s.user = :user AND s.analyzedAt >= :startDate")
    List<SpeechResult> findByUserAndAnalyzedAtAfter(
            @Param("user") User user,
            @Param("startDate") LocalDateTime startDate
    );
}