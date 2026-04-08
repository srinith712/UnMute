package com.unmute.websocket;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class GDWebSocketHandler extends TextWebSocketHandler {

    /* roomId → active sessions */
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    /* ─── Connection Established ───────────────────── */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {

        String roomId = extractRoomId(session);

        rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
                .add(session);

        log.info("WS CONNECTED → session={} room={}", session.getId(), roomId);

        broadcastToRoom(
                roomId,
                buildSystemMsg("user_joined", "A participant joined"),
                session
        );
    }

    /* ─── Handle Incoming Message ─────────────────── */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {

        String roomId = extractRoomId(session);
        String payload = message.getPayload();

        log.debug("WS MESSAGE → room={} payload={}", roomId, payload);

        /* Ping → Pong */
        if (payload.contains("\"type\":\"ping\"")) {
            sendSafe(session, "{\"type\":\"pong\"}");
            return;
        }

        /* Broadcast message */
        broadcastToRoom(roomId, payload, session);
    }

    /* ─── Connection Closed ───────────────────────── */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {

        String roomId = extractRoomId(session);
        Set<WebSocketSession> participants = rooms.get(roomId);

        if (participants != null) {
            participants.remove(session);

            if (participants.isEmpty()) {
                rooms.remove(roomId);
            } else {
                broadcastToRoom(
                        roomId,
                        buildSystemMsg("user_left", "A participant left"),
                        null
                );
            }
        }

        log.info("WS DISCONNECTED → session={} room={} reason={}",
                session.getId(), roomId, status);
    }

    /* ─── Error Handling ───────────────────────────── */
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WS ERROR → session={} error={}", session.getId(), exception.getMessage());
    }

    /* ─── Broadcast Helper ────────────────────────── */
    private void broadcastToRoom(String roomId, String payload, WebSocketSession exclude) {

        Set<WebSocketSession> participants =
                rooms.getOrDefault(roomId, Collections.emptySet());

        for (WebSocketSession s : participants) {
            if (s.isOpen() && !s.equals(exclude)) {
                sendSafe(s, payload);
            }
        }
    }

    /* ─── Safe Send ───────────────────────────────── */
    private void sendSafe(WebSocketSession session, String payload) {
        try {
            session.sendMessage(new TextMessage(payload));
        } catch (IOException e) {
            log.warn("WS SEND FAILED → session={} error={}", session.getId(), e.getMessage());
        }
    }

    /* ─── Extract Room ID ─────────────────────────── */
    private String extractRoomId(WebSocketSession session) {

        String path = Objects.requireNonNull(session.getUri()).getPath();
        String[] parts = path.split("/");

        return parts.length >= 4 ? parts[3] : "default";
    }

    /* ─── Build System Message ───────────────────── */
    private String buildSystemMsg(String type, String text) {
        return String.format(
                "{\"type\":\"%s\",\"payload\":{\"text\":\"%s\"},\"ts\":%d}",
                type,
                text,
                System.currentTimeMillis()
        );
    }
}