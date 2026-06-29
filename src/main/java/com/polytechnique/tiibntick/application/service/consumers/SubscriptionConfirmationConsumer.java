package com.polytechnique.tiibntick.application.service.consumers;

import com.polytechnique.tiibntick.infrastructure.kafka.event.SubscriptionAttemptEvent;
import com.polytechnique.tiibntick.domain.model.AnnouncementSubscription;
import com.polytechnique.tiibntick.domain.model.enums.announcement.AnnouncementStatus;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.AnnouncementRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.AnnouncementSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
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

        @KafkaListener(topics = "subscription-attempts", groupId = "tiibntick-subscription-group")
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
                                                                        AnnouncementSubscription subscription = new AnnouncementSubscription();
                                                                        subscription.setAnnouncementId(
                                                                                        announcement.getId());
                                                                        subscription.setDeliveryPersonId(
                                                                                        event.getDeliveryPersonId());
                                                                        subscription.setStatus("REGISTERED");
                                                                        subscription.setCreatedAt(Instant.now());

                                                                        return subscriptionRepository.save(subscription)
                                                                                        .doOnSuccess(sub -> log.info(
                                                                                                        "Subscription REGISTERED for Announcement {}",
                                                                                                        event.getAnnouncementId()))
                                                                                        .onErrorResume(DuplicateKeyException.class, e -> {
                                                                                                log.info("Duplicate subscription detected for Announcement {} by DeliveryPerson {} — ignoring",
                                                                                                                event.getAnnouncementId(), event.getDeliveryPersonId());
                                                                                                return Mono.empty();
                                                                                        });
                                                                }));
                                        } else {
                                                log.warn("Subscription REJECTED: Announcement {} is not PUBLISHED (Status: {})",
                                                                announcement.getId(), announcement.getStatus());
                                                return Mono.empty();
                                        }
                                })
                                .doOnError(e -> log.error("Error processing subscription for Announcement {}",
                                                event.getAnnouncementId(), e))
                                .subscribe();
        }
}
