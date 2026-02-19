package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.requests.DeliveryPersonUpdateRequest;
import com.polytechnique.tiibntick.dtos.responses.DeliveryPersonDetailsResponse;
import com.polytechnique.tiibntick.services.DeliveryPersonProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Controller for delivery person profile management.
 *
 * @author Kengfack Lagrange
 * @date 25/01/2026
 */
@RestController
@RequestMapping("/api/delivery-persons")
@RequiredArgsConstructor
public class DeliveryPersonController {

        private final DeliveryPersonProfileService profileService;

        @GetMapping("/{id}")
        public Mono<ResponseEntity<DeliveryPersonDetailsResponse>> getProfile(@PathVariable UUID id) {
                return profileService.getProfile(id)
                                .map(ResponseEntity::ok)
                                .onErrorResume(ResponseStatusException.class,
                                                e -> Mono.just(ResponseEntity.status(e.getStatusCode()).build()));
        }

        /**
         * Updates the delivery person's profile.
         * Sensitive fields trigger a pending update request.
         * Non-sensitive fields are updated immediately.
         *
         * @param id      the delivery person ID
         * @param request the update request
         * @return 200 OK
         */
        @PutMapping("/{id}")
        public Mono<ResponseEntity<Void>> updateProfile(
                        @PathVariable UUID id,
                        @Valid @RequestBody DeliveryPersonUpdateRequest request) {
                return profileService.updateProfile(id, request)
                                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                                .onErrorResume(ResponseStatusException.class,
                                                e -> Mono.just(ResponseEntity.status(e.getStatusCode()).<Void>build()));
        }

        @DeleteMapping("/{id}")
        public Mono<ResponseEntity<Void>> deleteProfile(@PathVariable UUID id) {
                return profileService.deleteProfile(id)
                                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                                .onErrorResume(ResponseStatusException.class,
                                                e -> Mono.just(ResponseEntity.status(e.getStatusCode()).<Void>build()));
        }
}
