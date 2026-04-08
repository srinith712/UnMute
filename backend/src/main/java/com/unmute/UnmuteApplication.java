package com.unmute;

import com.unmute.model.User;
import com.unmute.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@SpringBootApplication
public class UnmuteApplication {

    public static void main(String[] args) {
        SpringApplication.run(UnmuteApplication.class, args);
    }

    /* ─── Seed Demo User ───────────────────────────── */
    @Bean
    CommandLineRunner seedDemoUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            String demoEmail = "demo@unmute.app";

            if (userRepository.findByEmail(demoEmail).isEmpty()) {

                User demo = User.builder()
                        .name("Demo User")
                        .email(demoEmail)
                        .password(passwordEncoder.encode("Demo@1234"))
                        .level(1)
                        .xp(0)
                        .rating(1000)
                        .build();

                userRepository.save(demo);

                log.info("✅ Demo user created: {}", demoEmail);
            } else {
                log.info("ℹ️ Demo user already exists");
            }
        };
    }
}