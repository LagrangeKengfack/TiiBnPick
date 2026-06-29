package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.domain.port.in.AuthUseCase;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

/**
 * Inbound REST adapter for authentication.
 * Delegates to the AuthUseCase inbound port.
 *
 * @author TiiBnTick Team
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request login credentials
     * @return authentication response with token
     */
    @PostMapping("/login")
    public Mono<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
        return authUseCase.login(request);
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
            return authUseCase.logout(token)
                    .then(Mono.just(ResponseEntity.ok().<Void>build()));
        }
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
    }
}
