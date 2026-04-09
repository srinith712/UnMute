package com.unmute.service;

import com.unmute.model.SpeechResult;
import com.unmute.model.User;
import com.unmute.repository.SpeechResultRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserService userService;
    private final SpeechResultRepository speechResultRepository;

    /* ─── Dashboard Stats ───────────────── */
    @Transactional(readOnly = true)
    public Map<String, Object> getStats(String email) {

        User user = userService.getByEmail(email);

        long totalSessions = speechResultRepository.countByUser(user);
        Double avgScore = speechResultRepository.avgOverallScoreByUser(user);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("userId", user.getId());
        stats.put("name", user.getName());
        stats.put("level", user.getLevel());
        stats.put("xp", user.getXp());
        stats.put("rating", user.getRating());
        stats.put("totalSessions", totalSessions);
        stats.put("averageScore", avgScore != null
                ? Math.round(avgScore * 100.0) / 100.0
                : 0.0);
        stats.put("streak", computeStreak(user));

        return stats;
    }

    /* ─── Daily Task (ONLY ONE PER DAY) ───────────────── */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDailyTasks(String email) {

        User user = userService.getByEmail(email);

        List<Map<String, Object>> tasks = List.of(

                buildTask("1", "Self Introduction",
                        "Introduce yourself for 60 seconds",
                        "practice", false, 50),

                buildTask("2", "Tell a Story",
                        "Speak about a memorable experience",
                        "practice", false, 60),

                buildTask("3", "HR Question",
                        "Answer: Why should we hire you?",
                        "interview", false, 70),

                buildTask("4", "Strengths & Weakness",
                        "Explain your strengths and weaknesses",
                        "interview", false, 75),

                buildTask("5", "Group Discussion",
                        "Join a GD and speak for 2 minutes",
                        "gd", false, 100),

                buildTask("6", "Opinion Speaking",
                        "Give your opinion on online education",
                        "practice", false, 65),

                buildTask("7", "Learning Task",
                        "Watch a communication video",
                        "learning", false, 30),

                buildTask("8", "Daily Challenge",
                        "Speak confidently without pause for 1 min",
                        "challenge", false, 80)

        );

        // 🔥 Smart rotation using day of year
        int index = LocalDate.now().getDayOfYear() % tasks.size();

        return List.of(tasks.get(index)); // ✅ ONLY ONE TASK
    }

    /* ─── Weekly Progress ───────────────── */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProgress(String email) {

        User user = userService.getByEmail(email);

        List<SpeechResult> recent = speechResultRepository
                .findRecentByUser(user, PageRequest.of(0, 7));

        List<Map<String, Object>> mapped = recent.stream().map(r -> {

            Map<String, Object> point = new LinkedHashMap<>();

            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("MMM dd, HH:mm");
            point.put("date", r.getAnalyzedAt().format(formatter));

            point.put("fluency", r.getFluencyScore());
            point.put("grammar", r.getGrammarScore());
            point.put("confidence", r.getConfidenceScore());
            point.put("overall", r.getOverallScore());

            return point;

        }).collect(Collectors.toList());

        Collections.reverse(mapped);
        return mapped;
    }

    /* ─── Streak Logic ───────────────── */
    private int computeStreak(User user) {
        // Delegates to UserService which uses real lastActiveDate for consecutive-day tracking
        return userService.computeStreak(user);
    }

    /* ─── Build Task Helper ───────────────── */
    private Map<String, Object> buildTask(
            String id,
            String title,
            String description,
            String type,
            boolean completed,
            int xpReward
    ) {

        Map<String, Object> task = new LinkedHashMap<>();

        task.put("id", id);
        task.put("title", title);
        task.put("description", description);
        task.put("type", type);
        task.put("completed", completed);
        task.put("xpReward", xpReward);

        return task;
    }
}