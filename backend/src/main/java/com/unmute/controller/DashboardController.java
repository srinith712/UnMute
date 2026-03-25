package com.unmute.controller;

import com.unmute.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication auth) {
        return ResponseEntity.ok(dashboardService.getStats(auth.getName()));
    }

    /**
     * Returns { tasks: [...] } to match the frontend:
     *   tasksRes.value.data?.tasks || []
     */
    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> getDailyTasks(Authentication auth) {
        List<Map<String, Object>> tasks = dashboardService.getDailyTasks(auth.getName());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("tasks", tasks);
        return ResponseEntity.ok(response);
    }

    /**
     * Includes xpEarned so the frontend can update the user's XP display:
     *   if (res.data?.xpEarned) updateUser(...)
     */
    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeTask(
            Authentication auth,
            @PathVariable String taskId) {
        return ResponseEntity.ok(Map.of(
                "taskId", taskId,
                "completed", true,
                "xpEarned", 50,
                "message", "Task marked as complete!"
        ));
    }

    /**
     * Returns { weekly: [...] } to match the frontend:
     *   progressRes.value.data  (ProgressChart receives data?.weekly)
     */
    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getProgress(Authentication auth) {
        List<Map<String, Object>> weekly = dashboardService.getProgress(auth.getName());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("weekly", weekly);
        return ResponseEntity.ok(response);
    }
}
