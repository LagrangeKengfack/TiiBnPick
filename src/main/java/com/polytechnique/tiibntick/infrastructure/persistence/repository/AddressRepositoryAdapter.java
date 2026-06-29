package com.polytechnique.tiibntick.infrastructure.persistence.repository;

import com.polytechnique.tiibntick.domain.port.out.AddressRepository;
import com.polytechnique.tiibntick.domain.model.Address;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Outbound adapter: bridges the domain AddressRepository port to the R2DBC
 * Spring Data repository.
 */
@Component
@RequiredArgsConstructor
public class AddressRepositoryAdapter implements AddressRepository {

    private final com.polytechnique.tiibntick.infrastructure.persistence.repository.AddressRepository r2dbcRepository;

    @Override
    public Mono<Address> save(Address address) {
        return r2dbcRepository.save(address);
    }

    @Override
    public Mono<Address> findById(UUID id) {
        return r2dbcRepository.findById(id);
    }

    @Override
    public Flux<Address> findAll() {
        return r2dbcRepository.findAll();
    }

    @Override
    public Mono<Address> findFirstByStreetAndCityAndDistrictAndCountry(
            String street, String city, String district, String country) {
        return r2dbcRepository
                .findFirstByStreetIgnoreCaseAndCityIgnoreCaseAndDistrictIgnoreCaseAndCountryIgnoreCase(
                        street, city, district, country);
    }

    @Override
    public Mono<Void> deleteById(UUID id) {
        return r2dbcRepository.deleteById(id);
    }
}
