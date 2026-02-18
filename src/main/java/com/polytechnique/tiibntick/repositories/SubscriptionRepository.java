package com.polytechnique.tiibntick.repositories;

import com.polytechnique.tiibntick.models.Subscription;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Subscription entity operations.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
public interface SubscriptionRepository extends CrudRepository<Subscription, UUID> {
}
