package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.DeliveryPerson;
import com.polytechnique.tiibntick.domain.model.enums.deliveryPerson.DeliveryPersonStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound port for delivery person persistence operations.
 */
public interface DeliveryPersonRepository {

    Mono<DeliveryPerson> save(DeliveryPerson deliveryPerson);

    Mono<DeliveryPerson> findById(UUID id);

    Mono<DeliveryPerson> findByPersonId(UUID personId);

    Flux<DeliveryPerson> findAllByStatus(DeliveryPersonStatus status);

    Flux<DeliveryPerson> findAllActiveWithGpsCoordinates();

    Mono<Long> countByStatus(DeliveryPersonStatus status);

    Mono<Long> countByStatusAndIsActive(DeliveryPersonStatus status, Boolean isActive);

    Mono<Void> deleteById(UUID id);
}
