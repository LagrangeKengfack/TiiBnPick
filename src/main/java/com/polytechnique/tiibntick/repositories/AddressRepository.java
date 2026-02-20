package com.polytechnique.tiibntick.repositories;

import com.polytechnique.tiibntick.models.Address;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Reactive repository for Address entity.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
public interface AddressRepository extends ReactiveCrudRepository<Address, UUID> {
    Flux<Address> findByStreetContainingIgnoreCase(String street);

    Flux<Address> findByStreetContainingIgnoreCaseAndCityIgnoreCase(String street, String city);

    Mono<Address> findFirstByStreetIgnoreCaseAndCityIgnoreCaseAndDistrictIgnoreCaseAndCountryIgnoreCase(String street,
                                                                                                        String city, String district, String country);
}
