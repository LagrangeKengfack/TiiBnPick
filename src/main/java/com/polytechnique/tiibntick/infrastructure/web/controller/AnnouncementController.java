package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.domain.port.in.AnnouncementUseCase;
import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementResponseDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.subscription.AssignDeliveryPersonRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.subscription.SubscriptionRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.subscription.SubscriptionResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound REST adapter for announcement management.
 * Consolidates both announcement CRUD and subscription/assignment endpoints.
 * Delegates to the AnnouncementUseCase inbound port.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementUseCase announcementUseCase;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<AnnouncementResponseDTO> createAnnouncement(@RequestBody AnnouncementRequestDTO request) {
        return announcementUseCase.createAnnouncement(request);
    }

    @GetMapping
    public Flux<AnnouncementResponseDTO> getAllAnnouncements() {
        return announcementUseCase.getAllAnnouncements();
    }

    @GetMapping("/client/{clientId}")
    public Flux<AnnouncementResponseDTO> getAnnouncementsByClientId(@PathVariable UUID clientId) {
        return announcementUseCase.getAnnouncementsByClientId(clientId);
    }

    @GetMapping("/{id}")
    public Mono<AnnouncementResponseDTO> getAnnouncement(@PathVariable UUID id) {
        return announcementUseCase.getAnnouncement(id);
    }

    @PutMapping("/{id}")
    public Mono<AnnouncementResponseDTO> updateAnnouncement(
            @PathVariable UUID id, @RequestBody AnnouncementRequestDTO request) {
        return announcementUseCase.updateAnnouncement(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteAnnouncement(@PathVariable UUID id) {
        return announcementUseCase.deleteAnnouncement(id);
    }

    @PatchMapping("/{id}/publish")
    public Mono<AnnouncementResponseDTO> publishAnnouncement(@PathVariable UUID id) {
        return announcementUseCase.publishAnnouncement(id);
    }

    // Subscription endpoints

    @PostMapping("/{id}/subscribe")
    public Mono<ResponseEntity<Void>> subscribe(
            @PathVariable("id") UUID announcementId,
            @RequestBody SubscriptionRequestDTO request) {
        return announcementUseCase.initiateSubscription(announcementId, request.getDeliveryPersonId())
                .then(Mono.just(ResponseEntity.accepted().<Void>build()));
    }

    @GetMapping("/{id}/subscriptions")
    public Flux<SubscriptionResponseDTO> getSubscriptions(@PathVariable("id") UUID announcementId) {
        return announcementUseCase.getSubscriptionsForAnnouncement(announcementId);
    }

    @PostMapping("/{id}/assign")
    public Mono<ResponseEntity<AnnouncementResponseDTO>> assignDeliveryPerson(
            @PathVariable("id") UUID announcementId,
            @RequestBody AssignDeliveryPersonRequestDTO request) {
        return announcementUseCase.assignDeliveryPerson(announcementId, request.getDeliveryPersonId())
                .map(ResponseEntity::ok);
    }

    @GetMapping("/subscriptions/delivery-person/{deliveryPersonId}")
    public Flux<AnnouncementResponseDTO> getDeliveryPersonSubscriptions(
            @PathVariable UUID deliveryPersonId) {
        return announcementUseCase.getSubscriptionsByDeliveryPersonId(deliveryPersonId);
    }
}
