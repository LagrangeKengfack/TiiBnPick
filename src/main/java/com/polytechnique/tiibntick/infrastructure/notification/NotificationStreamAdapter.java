package com.polytechnique.tiibntick.infrastructure.notification;

import com.polytechnique.tiibntick.domain.port.out.NotificationStreamPort;
import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Outbound adapter: implements the NotificationStreamPort using Reactor Sinks
 * for real-time SSE streaming.
 */
@Component
@Slf4j
public class NotificationStreamAdapter implements NotificationStreamPort {

    private final Map<UUID, Sinks.Many<MatchingNotificationEvent>> userSinks = new ConcurrentHashMap<>();

    @Override
    public Flux<MatchingNotificationEvent> getNotificationStream(UUID deliveryPersonId) {
        log.info("Client connected to notification stream: {}", deliveryPersonId);
        return userSinks.computeIfAbsent(deliveryPersonId,
                id -> Sinks.many().multicast().onBackpressureBuffer())
                .asFlux();
    }

    @Override
    public void pushNotification(MatchingNotificationEvent event) {
        Sinks.Many<MatchingNotificationEvent> sink = userSinks.get(event.getDeliveryPersonId());
        if (sink != null) {
            log.info("Pushing real-time notification to client: {}", event.getDeliveryPersonId());
            sink.emitNext(event, Sinks.EmitFailureHandler.FAIL_FAST);
        } else {
            log.debug("No active stream for delivery person: {}", event.getDeliveryPersonId());
        }
    }
}
