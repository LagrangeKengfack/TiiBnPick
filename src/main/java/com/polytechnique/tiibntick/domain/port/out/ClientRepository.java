package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.Client;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound port for client persistence operations.
 */
public interface ClientRepository {

    Mono<Client> save(Client client);

    Mono<Client> findById(UUID id);

    Mono<Client> findByPersonId(UUID personId);

    Flux<Client> findAll();

    Mono<Void> deleteById(UUID id);
}
