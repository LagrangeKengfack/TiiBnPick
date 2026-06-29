package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.domain.port.in.ClientUseCase;
import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound REST adapter for client management.
 * Delegates to the ClientUseCase inbound port.
 */
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientUseCase clientUseCase;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ClientResponseDTO> createClient(@RequestBody ClientDTO clientDTO) {
        return clientUseCase.createClient(clientDTO);
    }

    @GetMapping("/check-email")
    public Mono<Boolean> checkEmail(@RequestParam String email) {
        return clientUseCase.checkEmailExists(email);
    }

    @GetMapping("/check-national-id")
    public Mono<Boolean> checkNationalId(@RequestParam String nationalId) {
        return clientUseCase.checkNationalIdExists(nationalId);
    }

    @GetMapping
    public Flux<ClientResponseDTO> getAllClients() {
        return clientUseCase.getAllClients();
    }

    @GetMapping("/{id}")
    public Mono<ClientResponseDTO> getClientById(@PathVariable UUID id) {
        return clientUseCase.getClientById(id);
    }

    @PutMapping("/{id}")
    public Mono<ClientResponseDTO> updateClient(@PathVariable UUID id, @RequestBody ClientDTO clientDTO) {
        return clientUseCase.updateClient(id, clientDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteClient(@PathVariable UUID id) {
        return clientUseCase.deleteClient(id);
    }
}
