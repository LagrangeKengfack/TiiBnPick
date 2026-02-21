package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.delivery.DeliveryRequestDTO;
import com.polytechnique.tiibntick.dtos.delivery.DeliveryResponseDTO;
import com.polytechnique.tiibntick.services.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;
import java.util.UUID;

/**
 * REST Controller for managing deliveries.
 *
 * @author François-Charles ATANGA
 * @date 21/02/2026
 *       Note: Added endpoints for creating deliveries and marking them as
 *       failed
 *       or cancelled (/fail, /cancel).
 */
@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<DeliveryResponseDTO> createDelivery(@Valid @RequestBody DeliveryRequestDTO request) {
        return deliveryService.createDelivery(request);
    }

    @PostMapping("/{id}/fail")
    public Mono<DeliveryResponseDTO> failDelivery(@PathVariable UUID id) {
        return deliveryService.failDelivery(id);
    }

    @PostMapping("/{id}/cancel")
    public Mono<DeliveryResponseDTO> cancelDelivery(@PathVariable UUID id) {
        return deliveryService.cancelDelivery(id);
    }

    @PostMapping("/{id}/pickup")
    public Mono<DeliveryResponseDTO> pickupDelivery(@PathVariable UUID id) {
        return deliveryService.pickupDelivery(id);
    }

    @GetMapping("/{id}/tracking")
    public Mono<com.polytechnique.tiibntick.dtos.responses.LocationResponseDTO> getDeliveryTracking(
            @PathVariable UUID id) {
        return deliveryService.getDeliveryLocation(id);
    }
}
