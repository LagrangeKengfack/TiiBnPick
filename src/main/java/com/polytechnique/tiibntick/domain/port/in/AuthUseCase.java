package com.polytechnique.tiibntick.domain.port.in;

import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthResponseDTO;
import reactor.core.publisher.Mono;

/**
 * Inbound port for authentication use cases.
 * Defines the contract that the REST adapter uses to interact with the domain.
 */
public interface AuthUseCase {

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request login credentials
     * @return authentication response with token
     */
    Mono<AuthResponseDTO> login(AuthRequestDTO request);

    /**
     * Invalidates a user's token.
     *
     * @param token the JWT token to invalidate
     * @return empty Mono on success
     */
    Mono<Void> logout(String token);
}
