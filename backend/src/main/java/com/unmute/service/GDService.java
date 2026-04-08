package com.unmute.service;

import com.unmute.model.GDSession;
import com.unmute.model.User;
import com.unmute.repository.GDSessionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GDService {

    private final GDSessionRepository gdSessionRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<GDSession> getActiveRooms() {
        return gdSessionRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(
                        GDSession.SessionStatus.WAITING,
                        GDSession.SessionStatus.ACTIVE
                )
        );
    }

    @Transactional
    public GDSession createRoom(String email) {

        User user = userService.getByEmail(email);

        GDSession session = GDSession.builder()
                .roomId(generateRoomId())
                .minRating(user.getRating() - 200)
                .maxRating(user.getRating() + 200)
                .build();

        session.getParticipants().add(user);

        return gdSessionRepository.save(session);
    }

    @Transactional
    public GDSession joinRoom(String email, String roomId) {

        User user = userService.getByEmail(email);

        GDSession session = gdSessionRepository.findByRoomId(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found")
                );

        if (session.getParticipants().stream()
                .noneMatch(p -> p.getEmail().equals(email))) {
            session.getParticipants().add(user);
        }

        if (session.getParticipants().size() >= 2) {
            session.setStatus(GDSession.SessionStatus.ACTIVE);
        }

        return gdSessionRepository.save(session);
    }

    @Transactional
    public GDSession leaveRoom(String email, String roomId) {

        GDSession session = gdSessionRepository.findByRoomId(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found")
                );

        session.getParticipants()
                .removeIf(p -> p.getEmail().equals(email));

        if (session.getParticipants().isEmpty()) {
            session.setStatus(GDSession.SessionStatus.COMPLETED);
        }

        return gdSessionRepository.save(session);
    }

    private String generateRoomId() {
        return UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }
}