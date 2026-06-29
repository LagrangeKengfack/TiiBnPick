package com.polytechnique.tiibntick.domain.port.in;

import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonUpdateRequest;
import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonDetailsResponse;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound port for delivery person profile management use cases.
 */
public interface DeliveryPersonProfileUseCase {

    Mono<DeliveryPersonDetailsResponse> getProfile(UUID id);

    Mono<Void> updateProfile(UUID id, DeliveryPersonUpdateRequest request);

    Mono<Void> deleteProfile(UUID id);
}
