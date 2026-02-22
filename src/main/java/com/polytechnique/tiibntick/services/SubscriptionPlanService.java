package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.subscription.SubscriptionPlanRequestDTO;
import com.polytechnique.tiibntick.models.Subscription;
import com.polytechnique.tiibntick.models.enums.subscription.SubscriptionStatus;
import com.polytechnique.tiibntick.models.enums.subscription.SubscriptionType;
import com.polytechnique.tiibntick.repositories.DeliveryPersonRepository;
import com.polytechnique.tiibntick.repositories.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Service to manage subscription plans for delivery persons.
 *
 * @author François-Charles ATANGA
 * @date 22/02/2026
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionPlanService {

        private final SubscriptionRepository subscriptionRepository;
        private final DeliveryPersonRepository deliveryPersonRepository;

        /**
         * Creates a new subscription plan and associates it with a delivery person.
         * The duration is fixed to 30 days.
         * Only FREE subscriptions are created as ACTIVE, others are PENDING.
         *
         * @param request the subscription plan request
         * @return a Mono containing the saved subscription
         */
        @Transactional("connectionFactoryTransactionManager")
        public Mono<Subscription> createAndAssignSubscription(SubscriptionPlanRequestDTO request) {
                log.info("Creating subscription type {} for DeliveryPerson {}",
                                request.getSubscriptionType(), request.getDeliveryPersonId());

                return deliveryPersonRepository.findById(request.getDeliveryPersonId())
                                .switchIfEmpty(Mono.error(
                                                new RuntimeException("Delivery Person not found with ID: "
                                                                + request.getDeliveryPersonId())))
                                .flatMap(deliveryPerson -> {
                                        Subscription subscription = new Subscription();
                                        subscription.setId(UUID.randomUUID());
                                        subscription.setSubscriptionType(request.getSubscriptionType());

                                        // Logic: FREE is ACTIVE, others are PENDING
                                        SubscriptionStatus status = (request
                                                        .getSubscriptionType() == SubscriptionType.FREE)
                                                                        ? SubscriptionStatus.ACTIVE
                                                                        : SubscriptionStatus.PENDING;
                                        subscription.setStatus(status);

                                        subscription.setStartDate(Instant.now());
                                        subscription.setEndDate(Instant.now().plus(Duration.ofDays(30)));
                                        subscription.setPrice(request.getPrice());
                                        subscription.setPaymentMethod(request.getPaymentMethod());

                                        return subscriptionRepository.save(subscription)
                                                        .flatMap(savedSub -> {
                                                                deliveryPerson.setSubscriptionId(savedSub.getId());
                                                                return deliveryPersonRepository.save(deliveryPerson)
                                                                                .thenReturn(savedSub);
                                                        });
                                })
                                .doOnSuccess(sub -> log.info("Subscription {} created and linked to DeliveryPerson {}",
                                                sub.getId(), request.getDeliveryPersonId()))
                                .doOnError(e -> log.error("Failed to create subscription for DeliveryPerson {}",
                                                request.getDeliveryPersonId(), e));
        }

        /**
         * Expires a subscription if it is ACTIVE and its end date has passed.
         *
         * @param subscriptionId the subscription identifier
         * @return a Mono containing the expired subscription
         */
        @Transactional("connectionFactoryTransactionManager")
        public Mono<Subscription> expireSubscription(UUID subscriptionId) {
                log.info("Attempting to expire subscription {}", subscriptionId);

                return subscriptionRepository.findById(subscriptionId)
                                .switchIfEmpty(Mono.error(new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Subscription not found")))
                                .flatMap(subscription -> {
                                        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                                                return Mono.error(
                                                                new org.springframework.web.server.ResponseStatusException(
                                                                                org.springframework.http.HttpStatus.BAD_REQUEST,
                                                                                "Only ACTIVE subscriptions can be expired. Current status: "
                                                                                                + subscription.getStatus()));
                                        }

                                        if (subscription.getEndDate() != null
                                                        && subscription.getEndDate().isAfter(Instant.now())) {
                                                return Mono.error(
                                                                new org.springframework.web.server.ResponseStatusException(
                                                                                org.springframework.http.HttpStatus.BAD_REQUEST,
                                                                                "Subscription has not reached its end date yet. End date: "
                                                                                                + subscription.getEndDate()));
                                        }

                                        subscription.setStatus(SubscriptionStatus.EXPIRED);
                                        return subscriptionRepository.save(subscription);
                                })
                                .doOnSuccess(sub -> log.info("Subscription {} successfully EXPIRED", subscriptionId))
                                .doOnError(e -> log.error("Failed to expire subscription {}", subscriptionId, e));
        }

        /**
         * Finds and expires all ACTIVE subscriptions whose end date has passed.
         * This method is intended to be called by a background scheduler.
         *
         * @return a Mono signaling completion
         */
        @Transactional("connectionFactoryTransactionManager")
        public Mono<Void> processAutomatedExpirations() {
                log.info("Starting automated subscription expiration process...");

                return subscriptionRepository.findAllByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, Instant.now())
                                .flatMap(subscription -> {
                                        log.info("Subscription {} has reached its end date ({}). Expiring...",
                                                        subscription.getId(), subscription.getEndDate());
                                        subscription.setStatus(SubscriptionStatus.EXPIRED);
                                        return subscriptionRepository.save(subscription);
                                })
                                .then()
                                .doOnSuccess(v -> log.info("Automated subscription expiration process completed."))
                                .doOnError(e -> log.error("Error during automated subscription expiration process", e));
        }

        /**
         * Cancels an active subscription before its end date.
         *
         * @param subscriptionId the subscription identifier
         * @return a Mono containing the cancelled subscription
         */
        @Transactional("connectionFactoryTransactionManager")
        public Mono<Subscription> cancelSubscription(UUID subscriptionId) {
                log.info("Attempting to cancel subscription {}", subscriptionId);

                return subscriptionRepository.findById(subscriptionId)
                                .switchIfEmpty(Mono.error(new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Subscription not found")))
                                .flatMap(subscription -> {
                                        if (subscription.getStatus() != SubscriptionStatus.ACTIVE
                                                        && subscription.getStatus() != SubscriptionStatus.PENDING) {
                                                return Mono.error(
                                                                new org.springframework.web.server.ResponseStatusException(
                                                                                org.springframework.http.HttpStatus.BAD_REQUEST,
                                                                                "Only ACTIVE or PENDING subscriptions can be cancelled. Current status: "
                                                                                                + subscription.getStatus()));
                                        }

                                        if (subscription.getStatus() == SubscriptionStatus.ACTIVE
                                                        && subscription.getEndDate() != null
                                                        && subscription.getEndDate().isBefore(Instant.now())) {
                                                return Mono.error(
                                                                new org.springframework.web.server.ResponseStatusException(
                                                                                org.springframework.http.HttpStatus.BAD_REQUEST,
                                                                                "Subscription has already expired. Cannot cancel."));
                                        }

                                        subscription.setStatus(SubscriptionStatus.CANCELLED);
                                        return subscriptionRepository.save(subscription);
                                })
                                .doOnSuccess(sub -> log.info("Subscription {} successfully CANCELLED", subscriptionId))
                                .doOnError(e -> log.error("Failed to cancel subscription {}", subscriptionId, e));
        }

        /**
         * Updates (renews) an existing subscription if it is not ACTIVE or PENDING.
         * Resets the start and end dates and applies the status rules of creation.
         *
         * @param subscriptionId the subscription identifier
         * @param request        the update details
         * @return a Mono containing the updated subscription
         */
        @Transactional("connectionFactoryTransactionManager")
        public Mono<Subscription> updateSubscription(UUID subscriptionId, SubscriptionPlanRequestDTO request) {
                log.info("Attempting to update/renew subscription {}", subscriptionId);

                return subscriptionRepository.findById(subscriptionId)
                                .switchIfEmpty(Mono.error(new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Subscription not found")))
                                .flatMap(subscription -> {
                                        if (subscription.getStatus() == SubscriptionStatus.ACTIVE
                                                        || subscription.getStatus() == SubscriptionStatus.PENDING) {
                                                return Mono.error(
                                                                new org.springframework.web.server.ResponseStatusException(
                                                                                org.springframework.http.HttpStatus.BAD_REQUEST,
                                                                                "Cannot update an ACTIVE or PENDING subscription. Current status: "
                                                                                                + subscription.getStatus()));
                                        }

                                        // Update fields
                                        subscription.setSubscriptionType(request.getSubscriptionType());
                                        subscription.setPrice(request.getPrice());
                                        subscription.setPaymentMethod(request.getPaymentMethod());

                                        // Reset dates (30 days duration)
                                        subscription.setStartDate(Instant.now());
                                        subscription.setEndDate(Instant.now().plus(Duration.ofDays(30)));

                                        // Apply status rules: FREE -> ACTIVE, others -> PENDING
                                        SubscriptionStatus newStatus = (request
                                                        .getSubscriptionType() == SubscriptionType.FREE)
                                                                        ? SubscriptionStatus.ACTIVE
                                                                        : SubscriptionStatus.PENDING;
                                        subscription.setStatus(newStatus);

                                        return subscriptionRepository.save(subscription);
                                })
                                .doOnSuccess(sub -> log.info("Subscription {} successfully updated to type {}",
                                                subscriptionId, request.getSubscriptionType()))
                                .doOnError(e -> log.error("Failed to update subscription {}", subscriptionId, e));
        }
}
