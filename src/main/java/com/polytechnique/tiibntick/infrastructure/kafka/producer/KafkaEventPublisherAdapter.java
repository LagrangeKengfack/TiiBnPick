package com.polytechnique.tiibntick.infrastructure.kafka.producer;

import com.polytechnique.tiibntick.domain.port.out.EventPublisher;
import com.polytechnique.tiibntick.infrastructure.kafka.event.AnnouncementPublishedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonCreatedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonValidatedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.SubscriptionAttemptEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Outbound adapter: implements the EventPublisher port using Kafka.
 * Translates shared events to Kafka messages.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaEventPublisherAdapter implements EventPublisher {

    private static final String TOPIC_DELIVERY_PERSON_CREATED = "delivery-person-created";
    private static final String TOPIC_DELIVERY_PERSON_VALIDATED = "delivery-person-validated";
    private static final String TOPIC_ANNOUNCEMENT_PUBLISHED = "announcement-published";
    private static final String TOPIC_SUBSCRIPTION_ATTEMPTS = "subscription-attempts";
    private static final String TOPIC_MATCHING_NOTIFICATIONS = "matching-notifications";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publishDeliveryPersonCreated(DeliveryPersonCreatedEvent event) {
        log.info("Publishing DeliveryPersonCreatedEvent for ID: {}", event.getDeliveryPersonId());
        kafkaTemplate.send(TOPIC_DELIVERY_PERSON_CREATED, event.getDeliveryPersonId().toString(), event);
    }

    @Override
    public void publishDeliveryPersonValidated(DeliveryPersonValidatedEvent event) {
        log.info("Publishing DeliveryPersonValidatedEvent for ID: {}, approved: {}",
                event.getDeliveryPersonId(), event.isApproved());
        kafkaTemplate.send(TOPIC_DELIVERY_PERSON_VALIDATED, event.getDeliveryPersonId().toString(), event);
    }

    @Override
    public void publishAnnouncementPublished(AnnouncementPublishedEvent event) {
        log.info("Publishing AnnouncementPublishedEvent for announcement ID: {}",
                event.getAnnouncement().getId());
        kafkaTemplate.send(TOPIC_ANNOUNCEMENT_PUBLISHED, event.getAnnouncement().getId().toString(), event);
    }

    @Override
    public void publishSubscriptionAttempt(SubscriptionAttemptEvent event) {
        log.info("Publishing SubscriptionAttemptEvent for deliveryPerson: {} and announcement: {}",
                event.getDeliveryPersonId(), event.getAnnouncementId());
        kafkaTemplate.send(TOPIC_SUBSCRIPTION_ATTEMPTS, event.getAnnouncementId().toString(), event);
    }

    @Override
    public void publishMatchingNotification(MatchingNotificationEvent event) {
        log.info("Publishing MatchingNotificationEvent for deliveryPerson: {} and announcement: {}",
                event.getDeliveryPersonId(), event.getAnnouncementId());
        kafkaTemplate.send(TOPIC_MATCHING_NOTIFICATIONS, event.getDeliveryPersonId().toString(), event);
    }
}
