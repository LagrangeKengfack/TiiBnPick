package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.subscription.SubscriptionPlanRequestDTO;
import com.polytechnique.tiibntick.models.Subscription;
import com.polytechnique.tiibntick.services.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Controller for managing subscription plans for delivery persons.
 *
 * @author François-Charles ATANGA
 * @date 22/02/2026
 */
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    /**
     * Creates a new subscription and associates it with the specified delivery
     * person.
     *
     * @param request the subscription plan request
     * @return a Mono containing the created subscription
     */
    @PostMapping
    public Mono<ResponseEntity<Subscription>> createSubscription(@RequestBody SubscriptionPlanRequestDTO request) {
        return subscriptionPlanService.createAndAssignSubscription(request)
                .map(ResponseEntity::ok);
    }

    /**
     * Expires a subscription based on its unique identifier.
     * Validates that the subscription is ACTIVE and its end date has passed.
     *
     * @param id the subscription identifier
     * @return a Mono containing the expired subscription
     */
    @PostMapping("/{id}/expire")
    public Mono<ResponseEntity<Subscription>> expireSubscription(@PathVariable("id") UUID id) {
        return subscriptionPlanService.expireSubscription(id)
                .map(ResponseEntity::ok);
    }

    /**
     * Cancels an active subscription based on its unique identifier.
     * Validates that the subscription is ACTIVE and its end date has NOT passed.
     *
     * @param id the subscription identifier
     * @return a Mono containing the cancelled subscription
     */
    @PostMapping("/{id}/cancel")
    public Mono<ResponseEntity<Subscription>> cancelSubscription(@PathVariable("id") UUID id) {
        return subscriptionPlanService.cancelSubscription(id)
                .map(ResponseEntity::ok);
    }

    /**
     * Updates an existing subscription based on its unique identifier.
     * Validates that the subscription is NOT ACTIVE or PENDING.
     *
     * @param id      the subscription identifier
     * @param request the update details
     * @return a Mono containing the updated subscription
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<Subscription>> updateSubscription(@PathVariable("id") UUID id,
            @RequestBody SubscriptionPlanRequestDTO request) {
        return subscriptionPlanService.updateSubscription(id, request)
                .map(ResponseEntity::ok);
    }
}
