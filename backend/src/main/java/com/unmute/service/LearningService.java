package com.unmute.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LearningService {

    private final UserService userService;

    private static final List<Map<String, Object>> VIDEOS = new ArrayList<>();

    static {
        // ── Interview Tips ───────────────────────────────────────
        VIDEOS.add(video("1", "How to Answer 'Tell Me About Yourself'",
                "🎤", "4:32", "BEGINNER", "Interview Tips",
                "Master the most common interview opener with the Present-Past-Future formula."));
        VIDEOS.add(video("2", "Behavioural Questions – STAR Method",
                "⭐", "6:15", "INTERMEDIATE", "Interview Tips",
                "Use Situation-Task-Action-Result to craft powerful, structured answers."));
        VIDEOS.add(video("3", "Answering Salary Expectation Questions",
                "💰", "3:48", "INTERMEDIATE", "Interview Tips",
                "Navigate tricky compensation discussions with confidence and strategy."));

        // ── Body Language ────────────────────────────────────────
        VIDEOS.add(video("4", "Power Postures for Interviews",
                "💪", "5:10", "BEGINNER", "Body Language",
                "Learn how your posture signals confidence before you even speak."));
        VIDEOS.add(video("5", "Eye Contact Mastery",
                "👁️", "3:55", "BEGINNER", "Body Language",
                "Avoid the two extremes: staring vs. darting eyes. Find your zone."));
        VIDEOS.add(video("6", "Gestures That Command Attention",
                "🙌", "4:40", "INTERMEDIATE", "Body Language",
                "Use your hands intentionally to reinforce your words."));

        // ── Voice & Tone ──────────────────────────────────────────
        VIDEOS.add(video("7", "Finding Your Confident Voice",
                "🔊", "5:30", "BEGINNER", "Voice & Tone",
                "Practical breathing and resonance exercises for a powerful speaking voice."));
        VIDEOS.add(video("8", "Eliminating Filler Words",
                "🚫", "4:05", "BEGINNER", "Voice & Tone",
                "Replace 'um', 'uh', and 'like' with purposeful pauses."));
        VIDEOS.add(video("9", "Pace, Pitch, and Pause",
                "🎵", "6:00", "INTERMEDIATE", "Voice & Tone",
                "Control your delivery speed, vocal variety, and the power of silence."));

        // ── GD Techniques ────────────────────────────────────────
        VIDEOS.add(video("10", "How to Initiate a Group Discussion",
                "🚀", "4:20", "BEGINNER", "GD Techniques",
                "Win the crowd from the first sentence with these opening strategies."));
        VIDEOS.add(video("11", "GD – Interrupting Politely",
                "✋", "3:30", "INTERMEDIATE", "GD Techniques",
                "Reclaim the floor without sounding rude. Phrases that work every time."));
        VIDEOS.add(video("12", "Summarising and Concluding a GD",
                "📝", "4:00", "ADVANCED", "GD Techniques",
                "Make your mark at the end by delivering a crisp, balanced conclusion."));

        // ── Storytelling ────────────────────────────────────────
        VIDEOS.add(video("13", "The Pixar Storytelling Formula",
                "🎬", "5:50", "BEGINNER", "Storytelling",
                "Borrow Pixar's simple but powerful 6-sentence story arc for any situation."));
        VIDEOS.add(video("14", "Emotional Connection in Speech",
                "❤️", "4:45", "INTERMEDIATE", "Storytelling",
                "Move your audience by weaving emotion into fact-based narratives."));
        VIDEOS.add(video("15", "Opening Lines That Hook Attention",
                "🎣", "3:20", "BEGINNER", "Storytelling",
                "15 types of opening lines used by the world's best communicators."));
    }

    public List<Map<String, Object>> getAllVideos() {
        return Collections.unmodifiableList(VIDEOS);
    }

    public List<Map<String, Object>> getVideosByCategory(String category) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category)) {
            return getAllVideos();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> v : VIDEOS) {
            if (category.equalsIgnoreCase((String) v.get("category"))) {
                result.add(v);
            }
        }
        return result;
    }

    public void completeVideo(String email, String videoId) {
        // Award 30 XP for watching a learning video
        userService.addXp(email, 30);
    }

    private static Map<String, Object> video(String id, String title, String emoji,
                                              String duration, String difficulty,
                                              String category, String description) {
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
