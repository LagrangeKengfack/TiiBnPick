package com.polytechnique.tiibntick.domain.port.in;

import reactor.core.publisher.Mono;

/**
 * Inbound port for password setup use cases.
 */
public interface PasswordSetupUseCase {

    Mono<Void> setupPassword(String token, String newPassword);

    Mono<Void> requestPasswordReset(String email);
}
