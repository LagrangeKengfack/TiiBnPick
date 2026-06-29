package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.AnnouncementSubscriptionRepository;
import com.polytechnique.tiibntick.domain.model.AnnouncementSubscription;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound adapter: bridges the domain AnnouncementSubscriptionRepository port
 * to the R2DBC Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class AnnouncementSubscriptionRepositoryAdapter implements AnnouncementSubscriptionRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.AnnouncementSubscriptionRepository r2dbcRepository;

    @Override
    public Mono<AnnouncementSubscription> save(AnnouncementSubscription subscription) {
        return r2dbcRepository.save(subscription);
    }

    @Override
    public Mono<AnnouncementSubscription> findByAnnouncementIdAndDeliveryPersonId(
            UUID announcementId, UUID deliveryPersonId) {
        return r2dbcRepository.findByAnnouncementIdAndDeliveryPersonId(announcementId, deliveryPersonId);
    }

    @Override
    public Flux<AnnouncementSubscription> findAllByAnnouncementId(UUID announcementId) {
        return r2dbcRepository.findAllByAnnouncementId(announcementId);
    }

    @Override
    public Flux<AnnouncementSubscription> findAllByDeliveryPersonId(UUID deliveryPersonId) {
        return r2dbcRepository.findAllByDeliveryPersonId(deliveryPersonId);
    }
}
