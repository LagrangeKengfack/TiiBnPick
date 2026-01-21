package com.polytechnique.ticbnpick.repositories;

import com.polytechnique.ticbnpick.models.PersonAddress;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for PersonAddress entity operations.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Repository
public interface PersonAddressRepository extends CrudRepository<PersonAddress, UUID> {
}
