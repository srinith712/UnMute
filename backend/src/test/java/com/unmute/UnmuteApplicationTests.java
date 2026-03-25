package com.unmute;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Basic smoke test that verifies the Spring context loads correctly.
 * Uses a mock web environment so no real database connection is required.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
class UnmuteApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts without errors
    }
}
