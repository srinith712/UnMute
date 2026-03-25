package com.unmute.controller;

import com.unmute.model.GDSession;
import com.unmute.service.GDService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/gd")
@RequiredArgsConstructor
public class GDController {

    private final GDService gdService;

    @GetMapping("/rooms")
    public ResponseEntity<List<Map<String, Object>>> getRooms() {
        List<GDSession> rooms = gdService.getActiveRooms();
        return ResponseEntity.ok(rooms.stream().map(this::mapRoom).collect(Collectors.toList()));
    }

    @PostMapping("/rooms")
    public ResponseEntity<Map<String, Object>> createRoom(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        GDSession session = gdService.createRoom(
                auth.getName(), body.get("name"), body.get("topic"));
        return ResponseEntity.ok(mapRoom(session));
    }

    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<Map<String, Object>> joinRoom(
            Authentication auth,
            @PathVariable String roomId) {
        GDSession session = gdService.joinRoom(auth.getName(), roomId);
        return ResponseEntity.ok(mapRoom(session));
    }

    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<Map<String, Object>> leaveRoom(
            Authentication auth,
            @PathVariable String roomId) {
        GDSession session = gdService.leaveRoom(auth.getName(), roomId);
        return ResponseEntity.ok(mapRoom(session));
    }

    private Map<String, Object> mapRoom(GDSession s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("roomId", s.getRoomId());
        m.put("status", s.getStatus());
        m.put("participantCount", s.getParticipants().size());
        m.put("minRating", s.getMinRating());
        m.put("maxRating", s.getMaxRating());
        m.put("createdAt", s.getCreatedAt());
        return m;
    }
}
