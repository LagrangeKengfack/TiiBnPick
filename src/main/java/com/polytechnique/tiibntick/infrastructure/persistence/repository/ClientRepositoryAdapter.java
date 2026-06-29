package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.ClientRepository;
import com.polytechnique.tiibntick.domain.model.Client;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound adapter: bridges the domain ClientRepository port to the R2DBC
 * Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class ClientRepositoryAdapter implements ClientRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.ClientRepository r2dbcRepository;

    @Override
    public Mono<Client> save(Client client) {
        return r2dbcRepository.save(client);
    }

    @Override
    public Mono<Client> findById(UUID id) {
        return r2dbcRepository.findById(id);
    }

    @Override
    public Mono<Client> findByPersonId(UUID personId) {
        return r2dbcRepository.findByPersonId(personId);
    }

    @Override
    public Flux<Client> findAll() {
        return r2dbcRepository.findAll();
    }

    @Override
    public Mono<Void> deleteById(UUID id) {
        return r2dbcRepository.deleteById(id);
    }
}
