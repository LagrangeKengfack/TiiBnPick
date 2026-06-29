package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.Person;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound port for person persistence operations.
 * Decouples the application layer from the R2DBC infrastructure.
 */
public interface PersonRepository {

    Mono<Person> save(Person person);

    Mono<Person> findById(UUID id);

    Mono<Person> findByEmail(String email);

    Mono<Boolean> existsByEmail(String email);

    Mono<Boolean> existsByNationalId(String nationalId);

    Mono<Void> deleteById(UUID id);
}
