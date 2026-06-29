package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.Notification;
import reactor.core.publisher.Mono;

/**
 * Outbound port for notification persistence operations.
 */
public interface NotificationRepository {

    Mono<Notification> save(Notification notification);
}
