package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientResponseDTO;
import com.polytechnique.tiibntick.domain.model.enums.client.ClientStatus;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.ClientRepository;
import com.polytechnique.tiibntick.application.service.ClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Inbound REST adapter for admin client management.
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

    @GetMapping
    public Flux<ClientResponseDTO> getAllClients() {
        return clientService.getAllClients();
    }

    @PutMapping("/{id}/suspend")
    public Mono<ResponseEntity<Void>> suspendClient(@PathVariable UUID id) {
        return clientRepository.findById(id)
                .flatMap(client -> {
                    client.setStatus(ClientStatus.SUSPENDED);
                    return clientRepository.save(client);
                })
                .map(saved -> ResponseEntity.ok().<Void>build())
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/revoke")
    public Mono<ResponseEntity<Void>> revokeClient(@PathVariable UUID id) {
        return clientRepository.findById(id)
                .flatMap(client -> {
                    client.setStatus(ClientStatus.REVOKED);
                    return clientRepository.save(client);
                })
                .map(saved -> ResponseEntity.ok().<Void>build())
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/activate")
    public Mono<ResponseEntity<Void>> activateClient(@PathVariable UUID id) {
        return clientRepository.findById(id)
                .flatMap(client -> {
                    client.setStatus(ClientStatus.ACTIVE);
                    return clientRepository.save(client);
                })
                .map(saved -> ResponseEntity.ok().<Void>build())
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
