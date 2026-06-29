package com.polytechnique.tiibntick.application.service.consumers;

import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import com.polytechnique.tiibntick.application.service.support.NotificationStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * Kafka consumer that listens for matching notifications and forwards them
 * to the real-time stream service.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MatchingNotificationConsumer {

    private final NotificationStreamService notificationStreamService;

    @KafkaListener(topics = "matching-notifications", groupId = "tiibntick-stream-group")
    public void consumeMatchingNotification(MatchingNotificationEvent event) {
        log.info("Consumed MatchingNotificationEvent from Kafka: {}", event);
        notificationStreamService.pushNotification(event);
    }
}
