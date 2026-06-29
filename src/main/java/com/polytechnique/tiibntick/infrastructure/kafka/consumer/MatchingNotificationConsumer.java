package com.polytechnique.tiibntick.infrastructure.kafka.consumer;

import com.polytechnique.tiibntick.domain.port.out.NotificationStreamPort;
import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Inbound Kafka adapter: consumes matching notification events and forwards
 * them to the real-time SSE stream.
 *
 * @author François-Charles ATANGA
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class MatchingNotificationConsumer {

    private final NotificationStreamPort notificationStreamPort;

    @KafkaListener(topics = "matching-notifications", groupId = "tiibntick-stream-group")
    public void consumeMatchingNotification(MatchingNotificationEvent event) {
        log.info("Consumed MatchingNotificationEvent from Kafka: {}", event);
        notificationStreamPort.pushNotification(event);
    }
}
