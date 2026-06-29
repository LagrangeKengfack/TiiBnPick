package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.domain.port.in.DeliveryPersonProfileUseCase;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonUpdateRequest;
import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonDetailsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound REST adapter for delivery person profile management.
 * Delegates to the DeliveryPersonProfileUseCase inbound port.
 *
 * @author Kengfack Lagrange
 * @date 25/01/2026
 */
@RestController
@RequestMapping("/api/delivery-persons")
@RequiredArgsConstructor
public class DeliveryPersonController {

    private final DeliveryPersonProfileUseCase profileUseCase;

    @GetMapping("/{id}")
    public Mono<ResponseEntity<DeliveryPersonDetailsResponse>> getProfile(@PathVariable UUID id) {
        return profileUseCase.getProfile(id)
                .map(ResponseEntity::ok)
                .onErrorResume(ResponseStatusException.class,
                        e -> Mono.just(ResponseEntity.status(e.getStatusCode()).build()));
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<Void>> updateProfile(
            @PathVariable UUID id,
            @Valid @RequestBody DeliveryPersonUpdateRequest request) {
        return profileUseCase.updateProfile(id, request)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(ResponseStatusException.class,
                        e -> Mono.just(ResponseEntity.status(e.getStatusCode()).<Void>build()));
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteProfile(@PathVariable UUID id) {
        return profileUseCase.deleteProfile(id)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .onErrorResume(ResponseStatusException.class,
                        e -> Mono.just(ResponseEntity.status(e.getStatusCode()).<Void>build()));
    }
}
