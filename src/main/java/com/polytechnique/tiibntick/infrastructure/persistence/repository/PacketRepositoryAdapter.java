package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.PacketRepository;
import com.polytechnique.tiibntick.domain.model.Packet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound adapter: bridges the domain PacketRepository port to the R2DBC
 * Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class PacketRepositoryAdapter implements PacketRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.PacketRepository r2dbcRepository;

    @Override
    public Mono<Packet> save(Packet packet) {
        return r2dbcRepository.save(packet);
    }

    @Override
    public Mono<Packet> findById(UUID id) {
        return r2dbcRepository.findById(id);
    }

    @Override
    public Mono<Void> deleteById(UUID id) {
        return r2dbcRepository.deleteById(id);
    }
}
