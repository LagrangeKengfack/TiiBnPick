package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.subscription.AssignDeliveryPersonRequestDTO;
import com.polytechnique.tiibntick.dtos.subscription.SubscriptionRequestDTO;
import com.polytechnique.tiibntick.dtos.subscription.SubscriptionResponseDTO;
import com.polytechnique.tiibntick.dtos.announcement.AnnouncementResponseDTO;
import com.polytechnique.tiibntick.services.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Controller responsible for handling subscription requests from delivery
 * persons, listing subscriptions for an announcement, and assigning a
 * delivery person to an announcement.
 *
 * @author François-Charles ATANGA
 * @date 04/02/2026
 */
@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class SubscriptionController {

    private final AnnouncementService announcementService;

    @PostMapping("/{id}/subscribe")
    public Mono<ResponseEntity<Void>> subscribe(
            @PathVariable("id") UUID announcementId,
            @RequestBody SubscriptionRequestDTO request) {

        return announcementService.initiateSubscription(announcementId, request.getDeliveryPersonId())
                .then(Mono.just(ResponseEntity.accepted().build()));
    }

    @GetMapping("/{id}/subscriptions")
    public Flux<SubscriptionResponseDTO> getSubscriptions(
            @PathVariable("id") UUID announcementId) {
        return announcementService.getSubscriptionsForAnnouncement(announcementId);
    }

    @PostMapping("/{id}/assign")
    public Mono<ResponseEntity<AnnouncementResponseDTO>> assignDeliveryPerson(
            @PathVariable("id") UUID announcementId,
            @RequestBody AssignDeliveryPersonRequestDTO request) {
        return announcementService.assignDeliveryPerson(announcementId, request.getDeliveryPersonId())
                .map(ResponseEntity::ok);
    }

    @GetMapping("/subscriptions/delivery-person/{deliveryPersonId}")
    public Flux<AnnouncementResponseDTO> getDeliveryPersonSubscriptions(
            @PathVariable("deliveryPersonId") UUID deliveryPersonId) {
        return announcementService.getSubscriptionsByDeliveryPersonId(deliveryPersonId);
    }
}
