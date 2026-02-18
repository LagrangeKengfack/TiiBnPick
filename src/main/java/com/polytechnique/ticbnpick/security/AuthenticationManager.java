package com.polytechnique.ticbnpick.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom authentication manager for JWT token validation.
 * 
 * @author TicBnPick Team
 */
@Component
@RequiredArgsConstructor
public class AuthenticationManager implements ReactiveAuthenticationManager {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String authToken = authentication.getCredentials().toString();
        String username;
        try {
            username = jwtUtil.extractUsername(authToken);
        } catch (Exception e) {
            username = null;
        }
        
        // Check if token is blacklisted (user logged out)
        if (tokenBlacklistService.isBlacklisted(authToken)) {
            return Mono.empty();
        }
        
        if (username != null && jwtUtil.validateToken(authToken)) {
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            
            // Add role-based authority if present
            String role = jwtUtil.extractRole(authToken);
            if (role != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            }
            
            UsernamePasswordAuthenticationToken auth = 
                new UsernamePasswordAuthenticationToken(username, authToken, authorities);
            return Mono.just(auth);
        } else {
            return Mono.empty();
        }
    }
}
