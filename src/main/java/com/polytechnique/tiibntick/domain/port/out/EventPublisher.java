package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.infrastructure.kafka.event.AnnouncementPublishedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonCreatedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonValidatedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.SubscriptionAttemptEvent;

/**
 * Outbound port for publishing domain events.
 * Decouples application logic from the Kafka infrastructure.
 */
public interface EventPublisher {

    void publishDeliveryPersonCreated(DeliveryPersonCreatedEvent event);

    void publishDeliveryPersonValidated(DeliveryPersonValidatedEvent event);

    void publishAnnouncementPublished(AnnouncementPublishedEvent event);

    void publishSubscriptionAttempt(SubscriptionAttemptEvent event);

    void publishMatchingNotification(MatchingNotificationEvent event);
}
