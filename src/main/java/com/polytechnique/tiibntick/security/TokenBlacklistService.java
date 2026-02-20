package com.polytechnique.tiibntick.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory token blacklist service for logout functionality.
 * Tokens are stored with their expiration time and cleaned up periodically.
 * 
 * @author TiiBnTick Team
 */
@Service
public class TokenBlacklistService {

    private final Map<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

    /**
     * Adds a token to the blacklist.
     *
     * @param token the JWT token to blacklist
     * @param expirationTime the time when the token expires
     */
    public void blacklistToken(String token, Instant expirationTime) {
        blacklistedTokens.put(token, expirationTime);
    }

    /**
     * Checks if a token is blacklisted.
     *
     * @param token the JWT token to check
     * @return true if blacklisted, false otherwise
     */
    public boolean isBlacklisted(String token) {
        return blacklistedTokens.containsKey(token);
    }

    /**
     * Cleanup expired tokens from the blacklist every hour.
     * This prevents memory leaks from accumulated expired tokens.
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredTokens() {
        Instant now = Instant.now();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
