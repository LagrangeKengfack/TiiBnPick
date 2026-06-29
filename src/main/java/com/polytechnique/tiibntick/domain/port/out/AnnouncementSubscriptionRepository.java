package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.AnnouncementSubscription;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound port for announcement subscription persistence operations.
 */
public interface AnnouncementSubscriptionRepository {

    Mono<AnnouncementSubscription> save(AnnouncementSubscription subscription);

    Mono<AnnouncementSubscription> findByAnnouncementIdAndDeliveryPersonId(UUID announcementId, UUID deliveryPersonId);

    Flux<AnnouncementSubscription> findAllByAnnouncementId(UUID announcementId);

    Flux<AnnouncementSubscription> findAllByDeliveryPersonId(UUID deliveryPersonId);
}
