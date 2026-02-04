package com.polytechnique.ticbnpick.services.consumers;

import com.polytechnique.ticbnpick.events.SubscriptionAttemptEvent;
import com.polytechnique.ticbnpick.models.Announcement;
import com.polytechnique.ticbnpick.models.AnnouncementSubscription;
import com.polytechnique.ticbnpick.models.enums.announcement.AnnouncementStatus;
import com.polytechnique.ticbnpick.repositories.AnnouncementRepository;
import com.polytechnique.ticbnpick.repositories.AnnouncementSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * Kafka Consumer responsible for processing subscription attempts.
 * Verifies that the announcement is still published and ensures a delivery
 * person cannot subscribe twice.
 * Creates the official link in the database if all conditions are met.
 *
 * @author François-Charles ATANGA
 * @date 04/02/2026
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionConfirmationConsumer {

        private final AnnouncementRepository announcementRepository;
        private final AnnouncementSubscriptionRepository subscriptionRepository;

        @KafkaListener(topics = "subscription-attempts", groupId = "ticbnpick-subscription-group")
        public void consumeSubscriptionAttempt(SubscriptionAttemptEvent event) {
                log.info("Processing subscription attempt for Announcement {} by DeliveryPerson {}",
                                event.getAnnouncementId(), event.getDeliveryPersonId());

                announcementRepository.findById(event.getAnnouncementId())
                                .flatMap(announcement -> {
                                        if (announcement.getStatus() == AnnouncementStatus.PUBLISHED) {
                                                // Check if subscription already exists
                                                return subscriptionRepository.findByAnnouncementIdAndDeliveryPersonId(
                                                                event.getAnnouncementId(), event.getDeliveryPersonId())
                                                                .flatMap(existing -> {
                                                                        log.info("Delivery Person {} already subscribed to Announcement {}",
                                                                                        event.getDeliveryPersonId(),
                                                                                        event.getAnnouncementId());
                                                                        return Mono.empty();
                                                                })
                                                                .switchIfEmpty(Mono.defer(() -> {
                                                                        // Create the Subscription Link (PENDING status)
                                                                        AnnouncementSubscription subscription = new AnnouncementSubscription();
                                                                        subscription.setAnnouncementId(
                                                                                        announcement.getId());
                                                                        subscription.setDeliveryPersonId(
                                                                                        event.getDeliveryPersonId());
                                                                        subscription.setStatus("PENDING");
                                                                        subscription.setCreatedAt(Instant.now());

                                                                        return subscriptionRepository.save(subscription)
                                                                                        .doOnSuccess(sub -> log.info(
                                                                                                        "Subscription REGISTERED for Announcement {}",
                                                                                                        event.getAnnouncementId()));
                                                                }));
                                        } else {
                                                log.warn("Subscription REJECTED: Announcement {} is not PUBLISHED (Status: {})",
                                                                announcement.getId(), announcement.getStatus());
                                                return Mono.empty();
                                        }
                                })
                                .doOnError(e -> log.error("Error processing subscription for Announcement {}",
                                                event.getAnnouncementId(), e))
                                .block();
        }
}
