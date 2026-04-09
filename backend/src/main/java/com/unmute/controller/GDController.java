package com.unmute.controller;

import com.unmute.model.GDSession;
import com.unmute.service.GDService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gd")
@RequiredArgsConstructor
public class GDController {

    private final GDService gdService;

    @GetMapping("/rooms")
    public List<GDSession> getRooms() {
        return gdService.getActiveRooms();
    }

    @PostMapping("/create")
    public GDSession create(@RequestParam String email) {
        return gdService.createRoom(email);
    }

    @PostMapping("/join")
    public GDSession join(
            @RequestParam String email,
            @RequestParam String roomId
    ) {
        return gdService.joinRoom(email, roomId);
    }

    @PostMapping("/leave")
    public GDSession leave(
            @RequestParam String email,
            @RequestParam String roomId
    ) {
        return gdService.leaveRoom(email, roomId);
    }
}