package com.unmute.service;

import com.unmute.model.SpeechResult;
import com.unmute.model.User;
import com.unmute.repository.SpeechResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserService userService;
    private final SpeechResultRepository speechResultRepository;

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
        stats.put("averageScore", avgScore != null ? Math.round(avgScore * 100.0) / 100.0 : 0.0);
        stats.put("streak", computeStreak(user));
        return stats;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDailyTasks(String email) {
        User user = userService.getByEmail(email);
        long sessions = speechResultRepository.countByUser(user);

        List<Map<String, Object>> tasks = new ArrayList<>();

        tasks.add(buildTask("1", "Daily Practice",
                "Complete a 60-second speech on any topic", "practice",
                sessions > 0, 50));

        tasks.add(buildTask("2", "Interview Warm-Up",
                "Answer 3 HR questions confidently", "interview",
                user.getXp() >= 100, 75));

        tasks.add(buildTask("3", "Group Discussion",
                "Join a GD room and participate for 5 minutes", "gd",
                user.getRating() > 1050, 100));

        return tasks;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProgress(String email) {
        User user = userService.getByEmail(email);
        List<SpeechResult> recent = speechResultRepository
                .findRecentByUser(user, PageRequest.of(0, 7));

        return recent.stream().map(r -> {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", r.getAnalyzedAt().getDayOfWeek()
                    .getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            point.put("fluency", r.getFluencyScore());
            point.put("grammar", r.getGrammarScore());
            point.put("confidence", r.getConfidenceScore());
            point.put("overall", r.getOverallScore());
            return point;
        }).collect(Collectors.toList());
    }

    private int computeStreak(User user) {
        // Demo streak based on XP / 50
        return Math.min(user.getXp() / 50, 30);
    }

    private Map<String, Object> buildTask(String id, String title, String description,
                                           String type, boolean completed, int xpReward) {
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
