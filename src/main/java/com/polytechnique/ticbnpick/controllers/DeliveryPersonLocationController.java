package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.requests.DeliveryPersonLocationUpdateRequest;
import com.polytechnique.ticbnpick.services.DeliveryPersonLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Controller for managing delivery person location updates.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@RestController
@RequestMapping("/api/delivery-persons")
@RequiredArgsConstructor
public class DeliveryPersonLocationController {

    private final DeliveryPersonLocationService deliveryPersonLocationService;

    @PatchMapping("/{id}/location")
    public Mono<ResponseEntity<Void>> updateLocation(
            @PathVariable UUID id,
            @Valid @RequestBody DeliveryPersonLocationUpdateRequest request) {

        return deliveryPersonLocationService.updateLocation(id, request.getLatitude(), request.getLongitude())
                .then(Mono.just(ResponseEntity.ok().build()));
    }
}
