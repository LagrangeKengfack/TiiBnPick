package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.Driver;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import java.util.UUID;

public interface DriverRepository
        extends ReactiveCrudRepository<Driver, UUID> {
}