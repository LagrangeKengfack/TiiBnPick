package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.NotificationRepository;
import com.polytechnique.tiibntick.domain.model.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Outbound adapter: bridges the domain NotificationRepository port to the
 * R2DBC Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class NotificationRepositoryAdapter implements NotificationRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.NotificationRepository r2dbcRepository;

    @Override
    public Mono<Notification> save(Notification notification) {
        return r2dbcRepository.save(notification);
    }
}
