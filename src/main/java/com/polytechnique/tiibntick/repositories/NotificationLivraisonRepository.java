package com.polytechnique.tiibntick.repositories;

import com.polytechnique.tiibntick.models.NotificationLivraison;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for NotificationLivraison entity operations.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
public interface NotificationLivraisonRepository extends CrudRepository<NotificationLivraison, UUID> {
}
