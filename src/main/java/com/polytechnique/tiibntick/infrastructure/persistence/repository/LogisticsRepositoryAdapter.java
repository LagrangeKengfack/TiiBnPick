package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.LogisticsRepository;
import com.polytechnique.tiibntick.domain.model.Logistics;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound adapter: bridges the domain LogisticsRepository port to the R2DBC
 * Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class LogisticsRepositoryAdapter implements LogisticsRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.LogisticsRepository r2dbcRepository;

    @Override
    public Mono<Logistics> save(Logistics logistics) {
        return r2dbcRepository.save(logistics);
    }

    @Override
    public Mono<Logistics> findById(UUID id) {
        return r2dbcRepository.findById(id);
    }

    @Override
    public Mono<Logistics> findByDeliveryPersonId(UUID deliveryPersonId) {
        return r2dbcRepository.findByDeliveryPersonId(deliveryPersonId);
    }

    @Override
    public Mono<Void> deleteById(UUID id) {
        return r2dbcRepository.deleteById(id);
    }
}
