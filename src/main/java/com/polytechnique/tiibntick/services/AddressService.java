package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.AddressDTO;
import com.polytechnique.tiibntick.exceptions.DuplicateResourceException;
import com.polytechnique.tiibntick.exceptions.ResourceNotFoundException;
import com.polytechnique.tiibntick.models.Address;
import com.polytechnique.tiibntick.repositories.AddressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Service for Address CRUD operations with proper exception handling.
 *
 * @author Kengfack Lagrange
 * @date 17/12/2025
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    /**
     * Get all addresses
     */
    public Flux<Address> getAllAddresses() {
        log.info("Fetching all addresses");
        return addressRepository.findAll()
                .doOnNext(address -> log.debug("Retrieved address: {}", address.getId()))
                .doOnError(error -> log.error("Error retrieving addresses", error));
    }

    /**
     * Get address by ID
     * @throws ResourceNotFoundException if address not found
     */
    public Mono<Address> getAddressById(UUID id) {
        log.info("Fetching address with id: {}", id);

        return addressRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Address", "id", id)))
                .doOnSuccess(address -> log.info("Found address with id: {}", id))
                .doOnError(error -> {
                    if (!(error instanceof ResourceNotFoundException)) {
                        log.error("Error retrieving address with id: {}", id, error);
                    }
                });
    }

    /**
     * Create a new address from Request DTO
     * @throws DuplicateResourceException if address already exists
     */
    public Mono<Address> createAddress(AddressDTO requestDTO) {
        log.info("Creating new address: {}", requestDTO);

        // Vérifier si une adresse similaire existe déjà
        return checkIfAddressExists(requestDTO)
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new DuplicateResourceException(
                                "Address",
                                "street, city, district, country",
                                String.format("%s, %s, %s, %s",
                                        requestDTO.getStreet(),
                                        requestDTO.getCity(),
                                        requestDTO.getDistrict(),
                                        requestDTO.getCountry())
                        ));
                    }

                    // Créer l'adresse
                    Address address = new Address();
                    address.setStreet(requestDTO.getStreet());
                    address.setCity(requestDTO.getCity());
                    address.setDistrict(requestDTO.getDistrict());
                    address.setCountry(requestDTO.getCountry());
                    address.setDescription(requestDTO.getDescription());

                    return addressRepository.save(address)
                            .doOnSuccess(saved -> log.info("Created address with id: {}", saved.getId()))
                            .onErrorResume(DataIntegrityViolationException.class, error -> {
                                log.error("Data integrity violation while creating address: {}", requestDTO, error);
                                return Mono.error(new DuplicateResourceException("Address with similar data already exists"));
                            });
                });
    }

    /**
     * Update an existing address from Request DTO
     * @throws ResourceNotFoundException if address not found
     * @throws DuplicateResourceException if updated address conflicts with existing one
     */
    public Mono<Address> updateAddress(UUID id, AddressDTO requestDTO) {
        log.info("Updating address with id: {}", id);

        return addressRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Address", "id", id)))
                .flatMap(existingAddress -> {
                    // Vérifier si la nouvelle adresse n'existe pas déjà (pour un autre enregistrement)
                    return checkIfAddressExistsForUpdate(id, requestDTO)
                            .flatMap(exists -> {
                                if (exists) {
                                    return Mono.error(new DuplicateResourceException(
                                            "Address",
                                            "street, city, district, country",
                                            String.format("%s, %s, %s, %s",
                                                    requestDTO.getStreet(),
                                                    requestDTO.getCity(),
                                                    requestDTO.getDistrict(),
                                                    requestDTO.getCountry())
                                    ));
                                }

                                // Mettre à jour l'adresse
                                existingAddress.setStreet(requestDTO.getStreet());
                                existingAddress.setCity(requestDTO.getCity());
                                existingAddress.setDistrict(requestDTO.getDistrict());
                                existingAddress.setCountry(requestDTO.getCountry());
                                existingAddress.setDescription(requestDTO.getDescription());

                                return addressRepository.save(existingAddress)
                                        .doOnSuccess(updated -> log.info("Updated address with id: {}", id))
                                        .onErrorResume(DataIntegrityViolationException.class, error -> {
                                            log.error("Data integrity violation while updating address with id: {}", id, error);
                                            return Mono.error(new DuplicateResourceException("Address update would create a duplicate"));
                                        });
                            });
                });
    }

    /**
     * Delete an address
     * @throws ResourceNotFoundException if address not found
     */
    public Mono<Void> deleteAddress(UUID id) {
        log.info("Deleting address with id: {}", id);

        return addressRepository.existsById(id)
                .flatMap(exists -> {
                    if (!exists) {
                        return Mono.error(new ResourceNotFoundException("Address", "id", id));
                    }
                    return addressRepository.deleteById(id)
                            .doOnSuccess(v -> log.info("Deleted address with id: {}", id))
                            .doOnError(error -> log.error("Error deleting address with id: {}", id, error));
                });
    }

    /**
     * Check if address exists
     */
    public Mono<Boolean> existsById(UUID id) {
        log.debug("Checking if address exists with id: {}", id);
        return addressRepository.existsById(id);
    }

    /**
     * Search addresses by city
     */
    public Flux<Address> findByCity(String city) {
        log.info("Searching addresses by city: {}", city);

        if (city == null || city.trim().isEmpty()) {
            return Flux.error(new IllegalArgumentException("City parameter cannot be null or empty"));
        }

        return addressRepository.findAll()
                .filter(address -> city.equalsIgnoreCase(address.getCity()))
                .doOnComplete(() -> log.debug("Completed search for addresses in city: {}", city))
                .doOnError(error -> log.error("Error searching addresses by city: {}", city, error));
    }

    /**
     * Search addresses by country
     */
    public Flux<Address> findByCountry(String country) {
        log.info("Searching addresses by country: {}", country);

        if (country == null || country.trim().isEmpty()) {
            return Flux.error(new IllegalArgumentException("Country parameter cannot be null or empty"));
        }

        return addressRepository.findAll()
                .filter(address -> country.equalsIgnoreCase(address.getCountry()))
                .doOnComplete(() -> log.debug("Completed search for addresses in country: {}", country))
                .doOnError(error -> log.error("Error searching addresses by country: {}", country, error));
    }

    /**
     * Search addresses by district
     */
    public Flux<Address> findByDistrict(String district) {
        log.info("Searching addresses by district: {}", district);

        if (district == null || district.trim().isEmpty()) {
            return Flux.error(new IllegalArgumentException("District parameter cannot be null or empty"));
        }

        return addressRepository.findAll()
                .filter(address -> district.equalsIgnoreCase(address.getDistrict()))
                .doOnComplete(() -> log.debug("Completed search for addresses in district: {}", district))
                .doOnError(error -> log.error("Error searching addresses by district: {}", district, error));
    }

    /**
     * Check if an address already exists (for creation)
     */
    private Mono<Boolean> checkIfAddressExists(AddressDTO requestDTO) {
        return addressRepository.findAll()
                .filter(address ->
                        address.getStreet().equalsIgnoreCase(requestDTO.getStreet()) &&
                                address.getCity().equalsIgnoreCase(requestDTO.getCity()) &&
                                address.getDistrict().equalsIgnoreCase(requestDTO.getDistrict()) &&
                                address.getCountry().equalsIgnoreCase(requestDTO.getCountry())
                )
                .hasElements()
                .doOnNext(exists -> {
                    if (exists) {
                        log.warn("Duplicate address found: {} {} {} {}",
                                requestDTO.getStreet(),
                                requestDTO.getCity(),
                                requestDTO.getDistrict(),
                                requestDTO.getCountry());
                    }
                });
    }

    /**
     * Check if an address exists for update (excluding current address)
     */
    private Mono<Boolean> checkIfAddressExistsForUpdate(UUID currentId, AddressDTO requestDTO) {
        return addressRepository.findAll()
                .filter(address ->
                        !address.getId().equals(currentId) &&
                                address.getStreet().equalsIgnoreCase(requestDTO.getStreet()) &&
                                address.getCity().equalsIgnoreCase(requestDTO.getCity()) &&
                                address.getDistrict().equalsIgnoreCase(requestDTO.getDistrict()) &&
                                address.getCountry().equalsIgnoreCase(requestDTO.getCountry())
                )
                .hasElements()
                .doOnNext(exists -> {
                    if (exists) {
                        log.warn("Duplicate address found for update (excluding id: {}): {} {} {} {}",
                                currentId,
                                requestDTO.getStreet(),
                                requestDTO.getCity(),
                                requestDTO.getDistrict(),
                                requestDTO.getCountry());
                    }
                });
    }

    /**
     * Find addresses by street (partial match)
     */
    public Flux<Address> findByStreetContaining(String street) {
        log.info("Searching addresses containing street: {}", street);

        if (street == null || street.trim().isEmpty()) {
            return Flux.error(new IllegalArgumentException("Street parameter cannot be null or empty"));
        }

        String searchTerm = street.toLowerCase();
        return addressRepository.findAll()
                .filter(address ->
                        address.getStreet() != null &&
                                address.getStreet().toLowerCase().contains(searchTerm)
                )
                .doOnComplete(() -> log.debug("Completed search for addresses with street containing: {}", street))
                .doOnError(error -> log.error("Error searching addresses by street: {}", street, error));
    }

    /**
     * Get addresses count
     */
    public Mono<Long> count() {
        log.debug("Counting addresses");
        return addressRepository.count()
                .doOnSuccess(count -> log.debug("Total addresses count: {}", count))
                .doOnError(error -> log.error("Error counting addresses", error));
    }
}