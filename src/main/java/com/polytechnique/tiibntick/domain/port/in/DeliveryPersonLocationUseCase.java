package com.polytechnique.tiibntick.domain.port.in;

import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound port for delivery person location update use cases.
 */
public interface DeliveryPersonLocationUseCase {

    Mono<Void> updateLocation(UUID deliveryPersonId, Float latitude, Float longitude);
}
