package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.PersonRepository;
import com.polytechnique.tiibntick.domain.model.Person;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound adapter: bridges the domain PersonRepository port to the R2DBC
 * Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class PersonRepositoryAdapter implements PersonRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonRepository r2dbcRepository;

    @Override
    public Mono<Person> save(Person person) {
        return r2dbcRepository.save(person);
    }

    @Override
    public Mono<Person> findById(UUID id) {
        return r2dbcRepository.findById(id);
    }

    @Override
    public Mono<Person> findByEmail(String email) {
        return r2dbcRepository.findByEmail(email);
    }

    @Override
    public Mono<Boolean> existsByEmail(String email) {
        return r2dbcRepository.existsByEmail(email);
    }

    @Override
    public Mono<Boolean> existsByNationalId(String nationalId) {
        return r2dbcRepository.existsByNationalId(nationalId);
    }

    @Override
    public Mono<Void> deleteById(UUID id) {
        return r2dbcRepository.deleteById(id);
    }
}
