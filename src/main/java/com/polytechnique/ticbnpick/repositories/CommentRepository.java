package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.Comment;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Comment entity operations.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
public interface CommentRepository extends CrudRepository<Comment, UUID> {
}
