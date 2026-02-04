package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.address.AddressDTO;
import com.polytechnique.ticbnpick.dtos.requests.AddressCreateRequest;
import com.polytechnique.ticbnpick.models.Address;
import com.polytechnique.ticbnpick.mappers.AddressMapper;
import com.polytechnique.ticbnpick.services.address.CreationAddressService;
import com.polytechnique.ticbnpick.services.address.LectureAddressService;
import com.polytechnique.ticbnpick.services.address.ModificationAddressService;
import com.polytechnique.ticbnpick.services.address.SuppressionAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * REST controller for managing Addresses.
 *
 * @author François-Charles ATANGA
 */
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final CreationAddressService creationAddressService;
    private final LectureAddressService lectureAddressService;
    private final ModificationAddressService modificationAddressService;
    private final SuppressionAddressService suppressionAddressService;
    private final AddressMapper addressMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Address> createAddress(@RequestBody AddressCreateRequest request) {
        return creationAddressService.createAddress(addressMapper.toEntity(request));
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Address>> getAddressById(@PathVariable UUID id) {
        return lectureAddressService.getAddressById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping
    public Flux<Address> getAllAddresses() {
        return lectureAddressService.getAllAddresses();
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<Address>> updateAddress(@PathVariable UUID id,
            @RequestBody AddressCreateRequest request) {
        return lectureAddressService.getAddressById(id)
                .flatMap(existingAddress -> {
                    Address updatedAddress = addressMapper.toEntity(request);
                    updatedAddress.setId(existingAddress.getId()); // Preserve ID
                    return modificationAddressService.updateAddress(updatedAddress);
                })
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteAddress(@PathVariable UUID id) {
        return suppressionAddressService.deleteAddress(id);
    }
}
