package com.unmute.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handles WebSocket messages for Group Discussion rooms.
 * Rooms are keyed by roomId extracted from the URI path: /ws/gd/{roomId}
 */
@Slf4j
@Component
public class GDWebSocketHandler extends TextWebSocketHandler {

    // roomId -> set of sessions in that room
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String roomId = extractRoomId(session);
        rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
        log.info("WS connected: sessionId={} roomId={}", session.getId(), roomId);
        broadcastToRoom(roomId, buildSystemMsg("user_joined",
                "A new participant joined room " + roomId), session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String roomId = extractRoomId(session);
        log.debug("WS message in room={}: {}", roomId, message.getPayload());

        // Handle ping
        if (message.getPayload().contains("\"type\":\"ping\"")) {
            try { session.sendMessage(new TextMessage("{\"type\":\"pong\"}")); } catch (IOException ignored) {}
            return;
        }

        // Relay message to all other participants in the room
        broadcastToRoom(roomId, message.getPayload(), session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String roomId = extractRoomId(session);
        Set<WebSocketSession> participants = rooms.get(roomId);
        if (participants != null) {
            participants.remove(session);
            if (participants.isEmpty()) {
                rooms.remove(roomId);
            } else {
                broadcastToRoom(roomId, buildSystemMsg("user_left",
                        "A participant left room " + roomId), null);
            }
        }
        log.info("WS disconnected: sessionId={} roomId={} reason={}", session.getId(), roomId, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WS transport error in session={}: {}", session.getId(), exception.getMessage());
    }

    private void broadcastToRoom(String roomId, String payload, WebSocketSession exclude) {
        Set<WebSocketSession> participants = rooms.getOrDefault(roomId, Collections.emptySet());
        for (WebSocketSession s : participants) {
            if (s.isOpen() && !s.equals(exclude)) {
                try {
                    s.sendMessage(new TextMessage(payload));
                } catch (IOException e) {
                    log.warn("Failed to send WS message to session {}: {}", s.getId(), e.getMessage());
                }
            }
        }
    }

    private String extractRoomId(WebSocketSession session) {
        String path = Objects.requireNonNull(session.getUri()).getPath();
        // path = /ws/gd/{roomId}
        String[] parts = path.split("/");
        return parts.length >= 4 ? parts[3] : "default";
    }

    private String buildSystemMsg(String type, String text) {
        return String.format("{\"type\":\"%s\",\"payload\":{\"text\":\"%s\"},\"ts\":%d}",
                type, text, System.currentTimeMillis());
    }
}
