package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.AddressDTO;
import com.polytechnique.ticbnpick.dtos.AddressResponseDTO;
import com.polytechnique.ticbnpick.models.Address;
import com.polytechnique.ticbnpick.services.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * REST Controller for Address CRUD operations using WebFlux.
 *
 * @author Kengfack Lagrange
 * @date 17/12/2025
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /**
     * Get all addresses
     */
    @GetMapping
    public Flux<AddressResponseDTO> getAllAddresses() {
        log.info("GET /api/v1/addresses - Retrieving all addresses");
        return addressService.getAllAddresses()
                .map(this::convertToResponseDTO);
    }

    /**
     * Get address by ID
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<AddressResponseDTO>> getAddressById(@PathVariable UUID id) {
        log.info("GET /api/v1/addresses/{} - Retrieving address by ID", id);
        return addressService.getAddressById(id)
                .map(this::convertToResponseDTO)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Create a new address
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<AddressResponseDTO> createAddress(@Valid @RequestBody AddressDTO requestDTO) {
        log.info("POST /api/v1/addresses - Creating new address");
        return addressService.createAddress(requestDTO)
                .map(this::convertToResponseDTO);
    }

    /**
     * Update an existing address
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<AddressResponseDTO>> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody AddressDTO requestDTO) {

        log.info("PUT /api/v1/addresses/{} - Updating address", id);

        return addressService.updateAddress(id, requestDTO)
                .map(this::convertToResponseDTO)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Delete an address
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteAddress(@PathVariable UUID id) {
        log.info("DELETE /api/v1/addresses/{} - Deleting address", id);

        return addressService.existsById(id)
                .flatMap(exists -> {
                    if (exists) {
                        return addressService.deleteAddress(id)
                                .then(Mono.just(ResponseEntity.noContent().build()));
                    } else {
                        return Mono.just(ResponseEntity.notFound().build());
                    }
                });
    }

    /**
     * Search addresses by city
     */
    @GetMapping("/search/city")
    public Flux<AddressResponseDTO> searchByCity(@RequestParam String city) {
        log.info("GET /api/v1/addresses/search/city?city={} - Searching addresses by city", city);
        return addressService.findByCity(city)
                .map(this::convertToResponseDTO);
    }

    /**
     * Search addresses by country
     */
    @GetMapping("/search/country")
    public Flux<AddressResponseDTO> searchByCountry(@RequestParam String country) {
        log.info("GET /api/v1/addresses/search/country?country={} - Searching addresses by country", country);
        return addressService.findByCountry(country)
                .map(this::convertToResponseDTO);
    }

    /**
     * Check if address exists by ID
     */
    @GetMapping("/{id}/exists")
    public Mono<ResponseEntity<Boolean>> existsById(@PathVariable UUID id) {
        log.info("GET /api/v1/addresses/{}/exists - Checking if address exists", id);
        return addressService.existsById(id)
                .map(ResponseEntity::ok);
    }

    /**
     * Méthode utilitaire pour convertir Address → AddressResponseDTO
     * (Méthode privée dans le controller, pas besoin de classe séparée)
     */
    private AddressResponseDTO convertToResponseDTO(Address address) {
        if (address == null) {
            return null;
        }

        return new AddressResponseDTO(
                address.getId(),
                address.getStreet(),
                address.getCity(),
                address.getDistrict(),
                address.getCountry(),
                address.getDescription()
        );

    }
}