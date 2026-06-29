package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.PasswordToken;
import reactor.core.publisher.Mono;

/**
 * Outbound port for password token persistence operations.
 */
public interface PasswordTokenRepository {

    Mono<PasswordToken> save(PasswordToken token);

    Mono<PasswordToken> findByToken(String token);
}
