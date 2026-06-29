package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.model.AnnouncementSubscription;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

/**
 * Repository for managing AnnouncementSubscription entities.
 * Provides reactive CRUD operations to check and save subscriptions.
 *
 * @author François-Charles ATANGA
 * @date 04/02/2026
 */
@Repository
public interface AnnouncementSubscriptionRepository extends ReactiveCrudRepository<AnnouncementSubscription, UUID> {
    reactor.core.publisher.Mono<AnnouncementSubscription> findByAnnouncementIdAndDeliveryPersonId(UUID announcementId,
            UUID deliveryPersonId);

    Flux<AnnouncementSubscription> findAllByAnnouncementId(UUID announcementId);

    Flux<AnnouncementSubscription> findAllByDeliveryPersonId(UUID deliveryPersonId);
}
