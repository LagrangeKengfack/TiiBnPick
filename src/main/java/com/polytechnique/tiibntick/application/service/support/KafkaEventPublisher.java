package com.polytechnique.tiibntick.application.service.support;

import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonCreatedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonValidatedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Service for publishing Kafka events.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaEventPublisher {

    private static final String TOPIC_DELIVERY_PERSON_CREATED = "delivery-person-created";
    private static final String TOPIC_DELIVERY_PERSON_VALIDATED = "delivery-person-validated";

    private static final String TOPIC_ANNOUNCEMENT_PUBLISHED = "announcement-published";
    private static final String TOPIC_SUBSCRIPTION_ATTEMPTS = "subscription-attempts";
    private static final String TOPIC_MATCHING_NOTIFICATIONS = "matching-notifications";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publishes a DeliveryPersonCreatedEvent to Kafka.
     *
     * @param event the event to publish
     */
    public void publishDeliveryPersonCreated(DeliveryPersonCreatedEvent event) {
        log.info("Publishing DeliveryPersonCreatedEvent for ID: {}", event.getDeliveryPersonId());
        kafkaTemplate.send(TOPIC_DELIVERY_PERSON_CREATED, event.getDeliveryPersonId().toString(), event);
    }

    /**
     * Publishes a DeliveryPersonValidatedEvent to Kafka.
     *
     * @param event the event to publish
     */
    public void publishDeliveryPersonValidated(DeliveryPersonValidatedEvent event) {
        log.info("Publishing DeliveryPersonValidatedEvent for ID: {}, approved: {}",
                event.getDeliveryPersonId(), event.isApproved());
        kafkaTemplate.send(TOPIC_DELIVERY_PERSON_VALIDATED, event.getDeliveryPersonId().toString(), event);
    }

    /**
     * Publishes an AnnouncementPublishedEvent to Kafka.
     *
     * @param event the event to publish
     */
    public void publishAnnouncementPublished(com.polytechnique.tiibntick.infrastructure.kafka.event.AnnouncementPublishedEvent event) {
        log.info("Publishing AnnouncementPublishedEvent for announcement ID: {}", event.getAnnouncement().getId());
        kafkaTemplate.send(TOPIC_ANNOUNCEMENT_PUBLISHED, event.getAnnouncement().getId().toString(), event);
    }

    /**
     * Publishes a SubscriptionAttemptEvent to Kafka.
     *
     * @param event the event to publish
     */
    public void publishSubscriptionAttempt(com.polytechnique.tiibntick.infrastructure.kafka.event.SubscriptionAttemptEvent event) {
        log.info("Publishing SubscriptionAttemptEvent for deliveryPerson: {} and announcement: {}",
                event.getDeliveryPersonId(), event.getAnnouncementId());
        kafkaTemplate.send(TOPIC_SUBSCRIPTION_ATTEMPTS, event.getAnnouncementId().toString(), event);
    }

    /**
     * Publishes a MatchingNotificationEvent to Kafka.
     *
     * @param event the event to publish
     */
    public void publishMatchingNotification(MatchingNotificationEvent event) {
        log.info("Publishing MatchingNotificationEvent for deliveryPerson: {} and announcement: {}",
                event.getDeliveryPersonId(), event.getAnnouncementId());
        kafkaTemplate.send(TOPIC_MATCHING_NOTIFICATIONS, event.getDeliveryPersonId().toString(), event);
    }
}
