package com.polytechnique.tiibntick.repositories;

import com.polytechnique.tiibntick.models.Comment;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Comment entity operations.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
public interface CommentRepository extends ReactiveCrudRepository<Comment, UUID> {
}
