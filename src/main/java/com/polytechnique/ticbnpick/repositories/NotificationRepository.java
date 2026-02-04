package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.Notification;
import java.util.UUID;
<<<<<<< HEAD
import org.springframework.data.repository.CrudRepository;
=======
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
>>>>>>> subscription
import org.springframework.stereotype.Repository;

/**
 * Repository for Notification entity operations.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
<<<<<<< HEAD
public interface NotificationRepository extends CrudRepository<Notification, UUID> {
=======
public interface NotificationRepository extends ReactiveCrudRepository<Notification, UUID> {
>>>>>>> subscription
}
