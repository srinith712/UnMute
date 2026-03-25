package com.unmute.repository;

import com.unmute.model.GDSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GDSessionRepository extends JpaRepository<GDSession, Long> {

    Optional<GDSession> findByRoomId(String roomId);

    List<GDSession> findByStatusOrderByCreatedAtDesc(GDSession.SessionStatus status);

    @Query("SELECT g FROM GDSession g WHERE g.status IN ('WAITING', 'ACTIVE') ORDER BY g.createdAt DESC")
    List<GDSession> findActiveRooms();
}
