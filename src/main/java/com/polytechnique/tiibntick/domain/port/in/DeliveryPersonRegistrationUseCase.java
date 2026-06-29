package com.polytechnique.tiibntick.domain.port.in;

import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonRegistrationRequest;
import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonRegistrationResponse;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

/**
 * Inbound port for delivery person registration use case.
 */
public interface DeliveryPersonRegistrationUseCase {

    Mono<DeliveryPersonRegistrationResponse> register(
            DeliveryPersonRegistrationRequest request,
            FilePart photoCard,
            FilePart cniRecto,
            FilePart cniVerso,
            FilePart nuiPhoto,
            FilePart frontPhoto,
            FilePart backPhoto);
}
