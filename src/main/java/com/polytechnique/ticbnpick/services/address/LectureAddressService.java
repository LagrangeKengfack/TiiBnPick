package com.polytechnique.ticbnpick.services.address;

import com.polytechnique.ticbnpick.models.Address;
import com.polytechnique.ticbnpick.repositories.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Service specialized in Address retrieval.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Service
@RequiredArgsConstructor
public class LectureAddressService {

    private final AddressRepository addressRepository;

    /**
     * Retrieves an Address by its unique identifier.
     *
     * <p>
     * Queries the repository for an Address with the specified ID.
     *
     * @param id the UUID of the address to retrieve
     * @return a Mono containing the Address if found, or empty if not
     */
    public Mono<Address> getAddressById(UUID id) {
        return addressRepository.findById(id);
    }

    public Flux<Address> getAllAddresses() {
        return addressRepository.findAll();
    }

    /**
     * Searches for addresses by street name, optionally filtered by city.
     *
     * @param query the street name fragment to search for
     * @param city  the optional city name
     * @return a Flux of matching addresses
     */
    public Flux<Address> searchAddresses(String query, String city) {
        if (city == null || city.isBlank()) {
            return addressRepository.findByStreetContainingIgnoreCase(query);
        }
        return addressRepository.findByStreetContainingIgnoreCaseAndCityIgnoreCase(query, city);
    }
}
