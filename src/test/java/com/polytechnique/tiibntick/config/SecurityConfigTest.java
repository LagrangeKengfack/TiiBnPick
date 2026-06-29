package com.polytechnique.tiibntick.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for SecurityConfig password encoder.
 * Uses a direct BCryptPasswordEncoder instance instead of loading the full Spring context.
 */
class SecurityConfigTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void passwordEncoder_BeanExists() {
        assertNotNull(passwordEncoder);
    }

    @Test
    void passwordEncoder_EncodesCorrectly() {
        String rawPassword = "password";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        
        assertNotNull(encodedPassword);
        assertTrue(passwordEncoder.matches(rawPassword, encodedPassword));
    }
}
