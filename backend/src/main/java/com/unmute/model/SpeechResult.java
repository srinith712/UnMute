package com.unmute.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "speech_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeechResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "input_text", columnDefinition = "TEXT")
    private String inputText;

    @Column(name = "fluency_score")
    private Double fluencyScore;

    @Column(name = "grammar_score")
    private Double grammarScore;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "vocabulary_score")
    private Double vocabularyScore;

    @Column(name = "pronunciation_score")
    private Double pronunciationScore;

    @Column(name = "filler_words")
    private Integer fillerWords;

    @Column(name = "overall_score")
    private Double overallScore;

    @Column(name = "improvement_tips", columnDefinition = "TEXT")
    private String improvementTips;

    @Column(name = "analyzed_at", updatable = false)
    @Builder.Default
    private LocalDateTime analyzedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (analyzedAt == null) {
            analyzedAt = LocalDateTime.now();
        }
    }
}
