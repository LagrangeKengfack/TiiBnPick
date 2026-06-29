package com.polytechnique.tiibntick.domain.port.in;

import com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound port for address management use cases.
 */
public interface AddressUseCase {

    Mono<AddressDTO> createAddress(AddressDTO dto);

    Mono<AddressDTO> getAddressById(UUID id);

    Flux<AddressDTO> getAllAddresses();

    Mono<AddressDTO> updateAddress(UUID id, AddressDTO dto);

    Mono<Void> deleteAddress(UUID id);

    Flux<AddressDTO> searchAddresses(String query);
}
