package com.unmute.controller;

import com.unmute.service.DashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard APIs (TEMP: without authentication)
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "https://unmute-six.vercel.app"
})
public class DashboardController {

    private final DashboardService dashboardService;

    /* ── DEMO USER (TEMP FIX) ───────────── */
    private final String DEMO_EMAIL = "demo@unmute.app";

    /* ── Stats ───────────────────────── */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {

        Map<String, Object> stats =
                dashboardService.getStats(DEMO_EMAIL);

        return ResponseEntity.ok(stats);
    }

    /* ── Daily Task (ONLY ONE) ───────── */
    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> getDailyTasks() {

        List<Map<String, Object>> tasks =
                dashboardService.getDailyTasks(DEMO_EMAIL);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("tasks", tasks);

        return ResponseEntity.ok(response);
    }

    /* ── Complete Task ───────────────── */
    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeTask(
            @PathVariable String taskId
    ) {

        String today = LocalDate.now().toString();

        if (taskId == null || taskId.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid task"));
        }

        int xpEarned = 50;

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("taskId", taskId);
        response.put("completed", true);
        response.put("xpEarned", xpEarned);
        response.put("date", today);

        return ResponseEntity.ok(response);
    }

    /* ── Progress ───────────────────── */
    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getProgress() {

        List<Map<String, Object>> weekly =
                dashboardService.getProgress(DEMO_EMAIL);

        return ResponseEntity.ok(Map.of("weekly", weekly));
    }
}