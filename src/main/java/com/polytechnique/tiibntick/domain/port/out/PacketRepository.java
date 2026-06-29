package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.Packet;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound port for packet persistence operations.
 */
public interface PacketRepository {

    Mono<Packet> save(Packet packet);

    Mono<Packet> findById(UUID id);

    Mono<Void> deleteById(UUID id);
}
