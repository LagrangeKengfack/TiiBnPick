package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import reactor.core.publisher.Flux;

import java.util.UUID;

/**
 * Outbound port for real-time notification streaming (SSE).
 */
public interface NotificationStreamPort {

    Flux<MatchingNotificationEvent> getNotificationStream(UUID deliveryPersonId);

    void pushNotification(MatchingNotificationEvent event);
}
