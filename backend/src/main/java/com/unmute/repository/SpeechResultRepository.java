package com.unmute.repository;

import com.unmute.model.SpeechResult;
import com.unmute.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpeechResultRepository extends JpaRepository<SpeechResult, Long> {

    List<SpeechResult> findByUserOrderByAnalyzedAtDesc(User user);

    @Query("SELECT COUNT(s) FROM SpeechResult s WHERE s.user = :user")
    long countByUser(@Param("user") User user);

    @Query("SELECT AVG(s.overallScore) FROM SpeechResult s WHERE s.user = :user")
    Double avgOverallScoreByUser(@Param("user") User user);

    @Query("SELECT s FROM SpeechResult s WHERE s.user = :user ORDER BY s.analyzedAt DESC")
    List<SpeechResult> findRecentByUser(@Param("user") User user, org.springframework.data.domain.Pageable pageable);
}
