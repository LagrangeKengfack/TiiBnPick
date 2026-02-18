package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.Announcement;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

/**
 * Reactive repository for Announcement entity.
 *
 * @author Kengfack Lagrange
 * @date 17/12/2025
 */
public interface AnnouncementRepository extends ReactiveCrudRepository<Announcement, UUID> {

    /**
     * Finds all announcements created by a client.
     *
     * @param client_id client identifier
     * @return list of announcements
     */
    @Query("SELECT * FROM announcements WHERE client_id = :clientId")
    Flux<Announcement> findAllByClientId(UUID clientId);
}