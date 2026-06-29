package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.infrastructure.web.dto.requests.AddressCreateRequest;
import com.polytechnique.tiibntick.infrastructure.web.mapper.AddressMapper;
import com.polytechnique.tiibntick.domain.model.Address;
import com.polytechnique.tiibntick.application.service.address.CreationAddressService;
import com.polytechnique.tiibntick.application.service.address.LectureAddressService;
import com.polytechnique.tiibntick.application.service.address.ModificationAddressService;
import com.polytechnique.tiibntick.application.service.address.SuppressionAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound REST adapter for address management.
 * Currently delegates directly to address CRUD services (pending use case port extraction).
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

    @GetMapping("/search")
    public Flux<Address> searchAddresses(
            @RequestParam String query,
            @RequestParam(required = false) String city) {
        return lectureAddressService.searchAddresses(query, city);
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<Address>> updateAddress(
            @PathVariable UUID id, @RequestBody AddressCreateRequest request) {
        return lectureAddressService.getAddressById(id)
                .flatMap(existingAddress -> {
                    Address updatedAddress = addressMapper.toEntity(request);
                    updatedAddress.setId(existingAddress.getId());
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
