package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.domain.port.in.DeliveryPersonLocationUseCase;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonLocationUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound REST adapter for delivery person location updates.
 * Delegates to the DeliveryPersonLocationUseCase inbound port.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@RestController
@RequestMapping("/api/delivery-persons")
@RequiredArgsConstructor
public class DeliveryPersonLocationController {

    private final DeliveryPersonLocationUseCase locationUseCase;

    @PatchMapping("/{id}/location")
    public Mono<ResponseEntity<Void>> updateLocation(
            @PathVariable UUID id,
            @Valid @RequestBody DeliveryPersonLocationUpdateRequest request) {
        return locationUseCase.updateLocation(id,
                        request.getLatitude().floatValue(),
                        request.getLongitude().floatValue())
                .then(Mono.just(ResponseEntity.ok().<Void>build()));
    }
}
