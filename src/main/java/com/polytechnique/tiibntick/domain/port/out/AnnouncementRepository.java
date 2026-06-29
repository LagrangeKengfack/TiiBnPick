package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.Announcement;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound port for announcement persistence operations.
 */
public interface AnnouncementRepository {

    Mono<Announcement> save(Announcement announcement);

    Mono<Announcement> findById(UUID id);

    Flux<Announcement> findAll();

    Flux<Announcement> findAllByClientId(UUID clientId);

    Mono<Void> delete(Announcement announcement);
}
