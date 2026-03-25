package com.unmute;

import com.unmute.model.User;
import com.unmute.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@SpringBootApplication
@RequiredArgsConstructor
public class UnmuteApplication {

    public static void main(String[] args) {
        SpringApplication.run(UnmuteApplication.class, args);
    }

    @Bean
    CommandLineRunner seedDemoUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String demoEmail = "demo@unmute.app";
            if (userRepository.findByEmail(demoEmail).isEmpty()) {
                User demo = new User();
                demo.setName("Demo User");
                demo.setEmail(demoEmail);
                demo.setPassword(passwordEncoder.encode("Demo@1234"));
                demo.setLevel(1);
                demo.setXp(0);
                demo.setRating(1000);
                userRepository.save(demo);
                log.info("Demo user seeded: {}", demoEmail);
            }
        };
    }
}
