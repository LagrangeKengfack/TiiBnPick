package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.Personne;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import java.util.UUID;

public interface PersonneRepository
        extends ReactiveCrudRepository<Personne, UUID> {
}