package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.Logistics;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound port for logistics persistence operations.
 */
public interface LogisticsRepository {

    Mono<Logistics> save(Logistics logistics);

    Mono<Logistics> findById(UUID id);

    Mono<Logistics> findByDeliveryPersonId(UUID deliveryPersonId);

    Mono<Void> deleteById(UUID id);
}
