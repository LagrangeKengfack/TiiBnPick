package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.ClientDTO;
import com.polytechnique.ticbnpick.dtos.ClientResponseDTO;
import com.polytechnique.ticbnpick.services.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * REST Controller for client operations.
 * Provides endpoints for CRUD operations on clients.
 *
 * @author Kenmeugne Michèle
 * @date 18/12/2025
 */
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    /**
     * Creates a new client.
     *
     * @param clientDTO client data
     * @return created client response
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ClientResponseDTO> createClient(@Valid @RequestBody ClientDTO clientDTO) {
        return clientService.createClient(clientDTO);
    }

    /**
     * Retrieves a client by ID.
     *
     * @param id client identifier
     * @return client response
     */
    @GetMapping("/{id}")
    public Mono<ClientResponseDTO> getClientById(@PathVariable UUID id) {
        return clientService.getClientById(id);
    }

    /**
     * Retrieves all clients.
     *
     * @return flux of all clients
     */
    @GetMapping
    public Flux<ClientResponseDTO> getAllClients() {
        return clientService.getAllClients();
    }

    /**
     * Updates an existing client.
     *
     * @param id client identifier
     * @param clientDTO updated client data
     * @return updated client response
     */
    @PutMapping("/{id}")
    public Mono<ClientResponseDTO> updateClient(@PathVariable UUID id, @Valid @RequestBody ClientDTO clientDTO) {
        return clientService.updateClient(id, clientDTO);
    }

    /**
     * Deletes a client by ID.
     *
     * @param id client identifier
     * @return void
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteClient(@PathVariable UUID id) {
        return clientService.deleteClient(id);
    }
}