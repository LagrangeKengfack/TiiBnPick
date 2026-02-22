package com.polytechnique.tiibntick.repositories;

import com.polytechnique.tiibntick.models.Subscription;
import com.polytechnique.tiibntick.models.enums.subscription.SubscriptionStatus;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/**
 * Repository for Subscription entity operations (Reactive).
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
public interface SubscriptionRepository extends ReactiveCrudRepository<Subscription, UUID> {

    /**
     * Finds all subscriptions with a specific status and an end date before the
     * specified instant.
     *
     * @param status the subscription status
     * @param now    the current instant
     * @return a Flux of matching subscriptions
     */
    Flux<Subscription> findAllByStatusAndEndDateBefore(SubscriptionStatus status, Instant now);
}
