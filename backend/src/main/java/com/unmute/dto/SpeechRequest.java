package com.unmute.dto;

import jakarta.validation.constraints.AssertTrue;
import lombok.Data;

/**
 * Speech Request DTO
 * Used for analyzing speech input (text or audio)
 */
@Data
public class SpeechRequest {

    /**
     * Text content to be analyzed
     */
    private String text;

    /**
     * Optional: base64 encoded audio (WAV/MP3)
     */
    private String audioBase64;

    /**
     * Validation: at least one input must be present
     */
    @AssertTrue(message = "Either text or audio must be provided")
    public boolean isValidInput() {
        return (text != null && !text.isBlank()) ||
               (audioBase64 != null && !audioBase64.isBlank());
    }
}