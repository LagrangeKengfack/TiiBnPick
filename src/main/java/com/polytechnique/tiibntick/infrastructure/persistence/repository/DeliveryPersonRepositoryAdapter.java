package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.DeliveryPersonRepository;
import com.polytechnique.tiibntick.domain.model.DeliveryPerson;
import com.polytechnique.tiibntick.domain.model.enums.deliveryPerson.DeliveryPersonStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound adapter: bridges the domain DeliveryPersonRepository port to the
 * R2DBC Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class DeliveryPersonRepositoryAdapter implements DeliveryPersonRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository r2dbcRepository;

    @Override
    public Mono<DeliveryPerson> save(DeliveryPerson deliveryPerson) {
        return r2dbcRepository.save(deliveryPerson);
    }

    @Override
    public Mono<DeliveryPerson> findById(UUID id) {
        return r2dbcRepository.findById(id);
    }

    @Override
    public Mono<DeliveryPerson> findByPersonId(UUID personId) {
        return r2dbcRepository.findByPersonId(personId);
    }

    @Override
    public Flux<DeliveryPerson> findAllByStatus(DeliveryPersonStatus status) {
        return r2dbcRepository.findAllByStatus(status);
    }

    @Override
    public Flux<DeliveryPerson> findAllActiveWithGpsCoordinates() {
        return r2dbcRepository.findAllByIsActiveTrueAndLatitudeGpsIsNotNullAndLongitudeGpsIsNotNull();
    }

    @Override
    public Mono<Long> countByStatus(DeliveryPersonStatus status) {
        return r2dbcRepository.countByStatus(status);
    }

    @Override
    public Mono<Long> countByStatusAndIsActive(DeliveryPersonStatus status, Boolean isActive) {
        return r2dbcRepository.countByStatusAndIsActive(status, isActive);
    }

    @Override
    public Mono<Void> deleteById(UUID id) {
        return r2dbcRepository.deleteById(id);
    }
}
