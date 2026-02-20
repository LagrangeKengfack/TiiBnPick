package com.polytechnique.tiibntick.repositories;

import com.polytechnique.tiibntick.models.DeliveryPerson;
import com.polytechnique.tiibntick.models.enums.deliveryPerson.DeliveryPersonStatus;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Reactive repository for DeliveryPerson entity.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
public interface DeliveryPersonRepository extends ReactiveCrudRepository<DeliveryPerson, UUID> {

    /**
     * Finds a delivery person by associated person id.
     *
     * @param personId person identifier
     * @return matching delivery person
     */
    Mono<DeliveryPerson> findByPersonId(UUID personId);

    Mono<Long> countByStatus(DeliveryPersonStatus status);

    Mono<Long> countByStatusAndIsActive(DeliveryPersonStatus status, Boolean isActive);

    /**
     * Finds all delivery persons by status.
     *
     * @param status the status to filter by
     * @return a Flux of delivery persons
     */
    Flux<DeliveryPerson> findAllByStatus(DeliveryPersonStatus status);

    /**
     * Finds all active delivery persons with known GPS location.
     * Used as fallback when Elasticsearch is unavailable.
     *
     * @return a Flux of delivery persons with GPS coordinates
     */
    Flux<DeliveryPerson> findAllByIsActiveTrueAndLatitudeGpsIsNotNullAndLongitudeGpsIsNotNull();
}
