package com.polytechnique.tiibntick.repositories;

import com.polytechnique.tiibntick.models.Client;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

/**
 * Reactive repository for Client entity.
 *
 * @author Kengfack Lagrange
 * @date 17/12/2025
 */
public interface ClientRepository extends ReactiveCrudRepository<Client, UUID> {

    /**
     * Finds a client by associated person id.
     *
     * @param person_id person identifier
     * @return matching client
     */
    Mono<Client> findByPersonId(UUID personId);
}