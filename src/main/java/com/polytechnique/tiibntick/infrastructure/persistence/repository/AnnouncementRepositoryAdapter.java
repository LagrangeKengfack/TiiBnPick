package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.AnnouncementRepository;
import com.polytechnique.tiibntick.domain.model.Announcement;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound adapter: bridges the domain AnnouncementRepository port to the
 * R2DBC Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class AnnouncementRepositoryAdapter implements AnnouncementRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.AnnouncementRepository r2dbcRepository;

    @Override
    public Mono<Announcement> save(Announcement announcement) {
        return r2dbcRepository.save(announcement);
    }

    @Override
    public Mono<Announcement> findById(UUID id) {
        return r2dbcRepository.findById(id);
    }

    @Override
    public Flux<Announcement> findAll() {
        return r2dbcRepository.findAll();
    }

    @Override
    public Flux<Announcement> findAllByClientId(UUID clientId) {
        return r2dbcRepository.findAllByClientId(clientId);
    }

    @Override
    public Mono<Void> delete(Announcement announcement) {
        return r2dbcRepository.delete(announcement);
    }
}
