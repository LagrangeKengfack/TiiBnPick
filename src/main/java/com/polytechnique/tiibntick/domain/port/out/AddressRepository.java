package com.polytechnique.tiibntick.domain.port.out;

import com.polytechnique.tiibntick.domain.model.Address;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound port for address persistence operations.
 */
public interface AddressRepository {

    Mono<Address> save(Address address);

    Mono<Address> findById(UUID id);

    Flux<Address> findAll();

    Mono<Address> findFirstByStreetAndCityAndDistrictAndCountry(
            String street, String city, String district, String country);

    Mono<Void> deleteById(UUID id);
}
