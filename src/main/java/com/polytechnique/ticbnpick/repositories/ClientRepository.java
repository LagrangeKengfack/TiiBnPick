package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.Client;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import java.util.UUID;

public interface ClientRepository
        extends ReactiveCrudRepository<Client, UUID> {
}