package com.unmute.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LearningService {

    private final UserService userService;

    /* ─── Static Video Library ───────────────────────── */
    private static final List<Map<String, Object>> VIDEOS = new ArrayList<>();

    static {

        /* ── Interview Tips ── */
        VIDEOS.add(video("1", "How to Answer 'Tell Me About Yourself'", "🎤",
                "4:32", "BEGINNER", "Interview Tips",
                "Master the most common interview opener with the Present-Past-Future formula."));

        VIDEOS.add(video("2", "Behavioural Questions – STAR Method", "⭐",
                "6:15", "INTERMEDIATE", "Interview Tips",
                "Use Situation-Task-Action-Result to craft powerful, structured answers."));

        VIDEOS.add(video("3", "Answering Salary Expectation Questions", "💰",
                "3:48", "INTERMEDIATE", "Interview Tips",
                "Navigate tricky compensation discussions with confidence and strategy."));

        /* ── Body Language ── */
        VIDEOS.add(video("4", "Power Postures for Interviews", "💪",
                "5:10", "BEGINNER", "Body Language",
                "Learn how your posture signals confidence before you even speak."));

        VIDEOS.add(video("5", "Eye Contact Mastery", "👁️",
                "3:55", "BEGINNER", "Body Language",
                "Avoid the two extremes: staring vs darting eyes."));

        VIDEOS.add(video("6", "Gestures That Command Attention", "🙌",
                "4:40", "INTERMEDIATE", "Body Language",
                "Use your hands intentionally to reinforce your words."));

        /* ── Voice & Tone ── */
        VIDEOS.add(video("7", "Finding Your Confident Voice", "🔊",
                "5:30", "BEGINNER", "Voice & Tone",
                "Breathing and resonance exercises for strong voice."));

        VIDEOS.add(video("8", "Eliminating Filler Words", "🚫",
                "4:05", "BEGINNER", "Voice & Tone",
                "Replace 'um' and 'uh' with pauses."));

        VIDEOS.add(video("9", "Pace, Pitch, and Pause", "🎵",
                "6:00", "INTERMEDIATE", "Voice & Tone",
                "Control speed, pitch, and pauses."));

        /* ── GD Techniques ── */
        VIDEOS.add(video("10", "How to Initiate a Group Discussion", "🚀",
                "4:20", "BEGINNER", "GD Techniques",
                "Strong opening strategies."));

        VIDEOS.add(video("11", "GD – Interrupting Politely", "✋",
                "3:30", "INTERMEDIATE", "GD Techniques",
                "Interrupt respectfully."));

        VIDEOS.add(video("12", "Summarising a GD", "📝",
                "4:00", "ADVANCED", "GD Techniques",
                "Deliver crisp conclusions."));

        /* ── Storytelling ── */
        VIDEOS.add(video("13", "Pixar Storytelling Formula", "🎬",
                "5:50", "BEGINNER", "Storytelling",
                "Simple 6-step storytelling structure."));

        VIDEOS.add(video("14", "Emotional Connection", "❤️",
                "4:45", "INTERMEDIATE", "Storytelling",
                "Make speeches emotionally engaging."));

        VIDEOS.add(video("15", "Attention-Grabbing Openings", "🎣",
                "3:20", "BEGINNER", "Storytelling",
                "Hooks used by top speakers."));
    }

    /* ─── Get All Videos ───────────────────────────── */
    public List<Map<String, Object>> getAllVideos() {
        return Collections.unmodifiableList(VIDEOS);
    }

    /* ─── Filter by Category ───────────────────────── */
    public List<Map<String, Object>> getVideosByCategory(String category) {

        if (category == null || category.isBlank()
                || "all".equalsIgnoreCase(category)) {
            return getAllVideos();
        }

        return VIDEOS.stream()
                .filter(v -> category.equalsIgnoreCase((String) v.get("category")))
                .toList();
    }

    /* ─── Complete Video (XP Reward) ───────────────── */
    public void completeVideo(String email, String videoId) {
        userService.addXp(email, 30);
    }

    /* ─── Helper: Create Video Object ─────────────── */
    private static Map<String, Object> video(
            String id,
            String title,
            String emoji,
            String duration,
            String difficulty,
            String category,
            String description
    ) {

        Map<String, Object> m = new LinkedHashMap<>();

        m.put("id", id);
        m.put("title", title);
        m.put("emoji", emoji);
        m.put("duration", duration);
        m.put("difficulty", difficulty);
        m.put("category", category);
        m.put("description", description);

        return m;
    }
}