package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.subscription.SubscriptionRequestDTO;
import com.polytechnique.ticbnpick.services.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Controller responsible for handling subscription requests from delivery
 * persons.
 * Implements the "Fire & Forget" pattern by publishing events to Kafka without
 * synchronous database verification.
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
}
