package com.unmute.service;

import com.unmute.model.User;
import com.unmute.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    @Transactional
    public User updateProfile(String email, String name) {
        User user = getByEmail(email);
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        return userRepository.save(user);
    }

    @Transactional
    public User addXp(String email, int xpGained) {
        User user = getByEmail(email);
        int newXp = user.getXp() + xpGained;
        int newLevel = calculateLevel(newXp);
        user.setXp(newXp);
        user.setLevel(newLevel);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> getLeaderboard() {
        return userRepository.findTopByOrderByRatingDesc();
    }

    private int calculateLevel(int totalXp) {
        // Level up every 500 XP
        return Math.max(1, totalXp / 500 + 1);
    }
}
