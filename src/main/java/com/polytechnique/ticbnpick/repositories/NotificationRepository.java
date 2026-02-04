package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.Notification;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Notification entity operations.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
public interface NotificationRepository extends ReactiveCrudRepository<Notification, UUID> {
}
