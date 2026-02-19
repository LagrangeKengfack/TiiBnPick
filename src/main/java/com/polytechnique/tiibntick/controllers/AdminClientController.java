package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.client.ClientResponseDTO;
import com.polytechnique.tiibntick.models.Client;
import com.polytechnique.tiibntick.models.enums.client.ClientStatus;
import com.polytechnique.tiibntick.repositories.ClientRepository;
import com.polytechnique.tiibntick.services.ClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Controller for admin operations on clients.
 *
 * <p>
 * Provides endpoints for administrative management of client accounts:
 * <ul>
 * <li>Retrieval of all clients</li>
 * <li>Suspension of client accounts</li>
 * <li>Revocation of client accounts</li>
 * <li>Activation of suspended/revoked client accounts</li>
 * </ul>
 *
 * <p>
 * All endpoints require admin authentication.
 *
 * @author TiiBnTick Team
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/clients")
@RequiredArgsConstructor
public class AdminClientController {

    private final ClientService clientService;
    private final ClientRepository clientRepository;

    /**
     * Retrieves all clients with their person details.
     *
     * @return a Flux of ClientResponseDTO
     */
    @GetMapping
    public Flux<ClientResponseDTO> getAllClients() {
        log.info(">>> GET /api/admin/clients called");
        return clientService.getAllClients()
                .doOnNext(client -> log.info("  - Client: {} {} (status={})", client.getFirstName(), client.getLastName(), client.getStatus()))
                .doOnComplete(() -> log.info("<<< GET /api/admin/clients completed"))
                .onErrorResume(e -> {
                    log.error("!!! GET /api/admin/clients FAILED", e);
                    return Flux.empty();
                });
    }

    /**
     * Suspends a client account.
     *
     * @param id the UUID of the client to suspend
     * @return a Mono with status 200 OK on success
     */
    @PutMapping("/{id}/suspend")
    public Mono<ResponseEntity<Void>> suspendClient(@PathVariable UUID id) {
        return clientRepository.findById(id)
                .flatMap(client -> {
                    log.info(">>> Suspending client {}, current status={}", id, client.getStatus());
                    client.setStatus(ClientStatus.SUSPENDED);
                    return clientRepository.save(client);
                })
                .map(saved -> {
                    log.info("Client {} suspended", saved.getId());
                    return ResponseEntity.ok().<Void>build();
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Revokes a client account.
     *
     * @param id the UUID of the client to revoke
     * @return a Mono with status 200 OK on success
     */
    @PutMapping("/{id}/revoke")
    public Mono<ResponseEntity<Void>> revokeClient(@PathVariable UUID id) {
        return clientRepository.findById(id)
                .flatMap(client -> {
                    log.info(">>> Revoking client {}, current status={}", id, client.getStatus());
                    client.setStatus(ClientStatus.REVOKED);
                    return clientRepository.save(client);
                })
                .map(saved -> {
                    log.info("Client {} revoked", saved.getId());
                    return ResponseEntity.ok().<Void>build();
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Activates a suspended or revoked client account.
     *
     * @param id the UUID of the client to activate
     * @return a Mono with status 200 OK on success
     */
    @PutMapping("/{id}/activate")
    public Mono<ResponseEntity<Void>> activateClient(@PathVariable UUID id) {
        return clientRepository.findById(id)
                .flatMap(client -> {
                    log.info(">>> Activating client {}, current status={}", id, client.getStatus());
                    client.setStatus(ClientStatus.ACTIVE);
                    return clientRepository.save(client);
                })
                .map(saved -> {
                    log.info("Client {} activated", saved.getId());
                    return ResponseEntity.ok().<Void>build();
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
