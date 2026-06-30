package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.model.OpeningHours;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import java.util.UUID;

@Repository
public interface OpeningHoursRepository extends ReactiveCrudRepository<OpeningHours, UUID> {
    Flux<OpeningHours> findAllByLogisticsId(UUID logisticsId);
}
