package com.polytechnique.tiibntick.domain.port.in;

import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementResponseDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.subscription.SubscriptionResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound port for announcement management use cases.
 */
public interface AnnouncementUseCase {

    Mono<AnnouncementResponseDTO> createAnnouncement(AnnouncementRequestDTO request);

    Flux<AnnouncementResponseDTO> getAllAnnouncements();

    Mono<AnnouncementResponseDTO> getAnnouncement(UUID id);

    Flux<AnnouncementResponseDTO> getAnnouncementsByClientId(UUID clientId);

    Mono<AnnouncementResponseDTO> updateAnnouncement(UUID id, AnnouncementRequestDTO request);

    Mono<Void> deleteAnnouncement(UUID id);

    Mono<AnnouncementResponseDTO> publishAnnouncement(UUID id);

    Mono<Void> initiateSubscription(UUID announcementId, UUID deliveryPersonId);

    Flux<SubscriptionResponseDTO> getSubscriptionsForAnnouncement(UUID announcementId);

    Mono<AnnouncementResponseDTO> assignDeliveryPerson(UUID announcementId, UUID deliveryPersonId);

    Flux<AnnouncementResponseDTO> getSubscriptionsByDeliveryPersonId(UUID deliveryPersonId);
}
