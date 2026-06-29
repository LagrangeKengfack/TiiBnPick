package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.PasswordTokenRepository;
import com.polytechnique.tiibntick.domain.model.PasswordToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Outbound adapter: bridges the domain PasswordTokenRepository port to the
 * R2DBC Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class PasswordTokenRepositoryAdapter implements PasswordTokenRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.PasswordTokenRepository r2dbcRepository;

    @Override
    public Mono<PasswordToken> save(PasswordToken token) {
        return r2dbcRepository.save(token);
    }

    @Override
    public Mono<PasswordToken> findByToken(String token) {
        return r2dbcRepository.findByToken(token);
    }
}
