package com.polytechnique.tiibntick.repositories;

import com.polytechnique.tiibntick.models.Packet;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

/**
 * Reactive repository for Packet entity.
 *
 * @author Kengfack Lagrange
 * @date 17/12/2025
 */
public interface PacketRepository extends ReactiveCrudRepository<Packet, UUID> {

    /**
     * Finds a packet by announcement id.
     *
     * @param announcement_id announcement identifier
     * @return matching packet
     */
//    Mono<Packet> findByAnnouncementId(UUID announcement_id);
}