package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.auth.AuthRequestDTO;
import com.polytechnique.ticbnpick.dtos.auth.AuthResponseDTO;
import com.polytechnique.ticbnpick.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

/**
 * Controller for authentication endpoints (login/logout).
 * 
 * @author TicBnPick Team
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request login credentials
     * @return authentication response with token
     */
    @PostMapping("/login")
    public Mono<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
        return authenticationService.login(request);
    }

    /**
     * Logs out the user by invalidating their token.
     *
     * @param authHeader Authorization header containing the Bearer token
     * @return 200 OK on success
     */
    @PostMapping("/logout")
    public Mono<ResponseEntity<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return authenticationService.logout(token)
                    .then(Mono.just(ResponseEntity.ok().<Void>build()));
        }
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
    }
}
