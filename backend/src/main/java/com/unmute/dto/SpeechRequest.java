package com.unmute.dto;

import lombok.Data;

@Data
public class SpeechRequest {

    /**
     * Text content to be analyzed.
     * Either text or a transcribed version of audio must be present.
     */
    private String text;

    /**
     * Optional: base64-encoded audio data (WAV/MP3).
     * In the mock implementation the text field will be used for scoring.
     */
    private String audioBase64;
}
