package com.polytechnique.tiibntick.domain.port.in;

import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound port for client management use cases.
 */
public interface ClientUseCase {

    Mono<ClientResponseDTO> createClient(ClientDTO clientDTO);

    Mono<ClientResponseDTO> getClientById(UUID id);

    Flux<ClientResponseDTO> getAllClients();

    Mono<ClientResponseDTO> updateClient(UUID id, ClientDTO clientDTO);

    Mono<Void> deleteClient(UUID id);

    Mono<Boolean> checkEmailExists(String email);

    Mono<Boolean> checkNationalIdExists(String nationalId);
}
