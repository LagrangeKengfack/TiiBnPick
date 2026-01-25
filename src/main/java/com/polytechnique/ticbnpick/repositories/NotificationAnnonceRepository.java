package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.NotificationAnnonce;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for NotificationAnnonce entity operations.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
public interface NotificationAnnonceRepository extends CrudRepository<NotificationAnnonce, UUID> {
}
