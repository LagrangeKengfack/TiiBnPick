package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.infrastructure.web.dto.requests.AdminDeliveryPersonValidationRequest;
import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonDetailsResponse;
import com.polytechnique.tiibntick.application.service.AdminDeliveryPersonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

/**
 * Inbound REST adapter for admin delivery person management.
 * Delegates to AdminDeliveryPersonService (to be refactored to use
 * AdminDeliveryPersonUseCase port in a future iteration).
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/delivery-persons")
@RequiredArgsConstructor
public class AdminDeliveryPersonController {

    private final AdminDeliveryPersonService adminService;

    @PutMapping("/validate")
    public Mono<ResponseEntity<Void>> validateRegistration(
            @Valid @RequestBody AdminDeliveryPersonValidationRequest request) {
        return adminService.validateRegistration(request)
                .map(v -> ResponseEntity.ok().<Void>build());
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<DeliveryPersonDetailsResponse>> getDetails(@PathVariable UUID id) {
        log.info(">>> GET /api/admin/delivery-persons/{} called", id);
        return adminService.getDeliveryPersonDetails(id)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    log.error("!!! GET /api/admin/delivery-persons/{} FAILED", id, e);
                    return Mono.just(ResponseEntity.internalServerError().build());
                });
    }

    @GetMapping
    public Mono<ResponseEntity<List<DeliveryPersonDetailsResponse>>> getAllDeliveryPersons(
            @RequestParam(required = false) com.polytechnique.tiibntick.domain.model.enums.deliveryPerson.DeliveryPersonStatus status) {
        return adminService.getAllDeliveryPersons(status)
                .collectList()
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    log.error("!!! GET /api/admin/delivery-persons FAILED", e);
                    return Mono.just(ResponseEntity.internalServerError().build());
                });
    }

    @PutMapping("/{id}/suspend")
    public Mono<ResponseEntity<Void>> suspendDeliveryPerson(@PathVariable UUID id) {
        return adminService.suspendDeliveryPerson(id)
                .map(v -> ResponseEntity.ok().<Void>build());
    }

    @PutMapping("/{id}/revoke")
    public Mono<ResponseEntity<Void>> revokeDeliveryPerson(@PathVariable UUID id) {
        return adminService.revokeDeliveryPerson(id)
                .map(v -> ResponseEntity.ok().<Void>build());
    }

    @PutMapping("/{id}/activate")
    public Mono<ResponseEntity<Void>> activateDeliveryPerson(@PathVariable UUID id) {
        return adminService.activateDeliveryPerson(id)
                .map(v -> ResponseEntity.ok().<Void>build());
    }
}
