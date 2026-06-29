package com.polytechnique.tiibntick.domain.port.in;

import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonDetailsResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound port for admin delivery person management use cases.
 */
public interface AdminDeliveryPersonUseCase {

    Flux<DeliveryPersonDetailsResponse> getPendingDeliveryPersons();

    Mono<Void> validateDeliveryPerson(UUID id, boolean approved, String reason);

    Mono<Void> suspendDeliveryPerson(UUID id);

    Mono<Void> revokeDeliveryPerson(UUID id);

    Mono<Void> activateDeliveryPerson(UUID id);
}
