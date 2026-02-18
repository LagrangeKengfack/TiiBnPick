package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.announcement.AnnouncementRequestDTO;
import com.polytechnique.ticbnpick.dtos.announcement.AnnouncementResponseDTO;
import com.polytechnique.ticbnpick.services.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * REST Controller for managing announcements.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 *       Note: Added publishAnnouncement endpoint (PATCH /{id}/publish) to
 *       trigger
 *       announcement publication and Kafka event.
 */
@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<AnnouncementResponseDTO> createAnnouncement(@RequestBody AnnouncementRequestDTO request) {
        return announcementService.createAnnouncement(request);
    }

    @GetMapping
    public Flux<AnnouncementResponseDTO> getAllAnnouncements() {
        return announcementService.getAllAnnouncements();
    }

    @GetMapping("/client/{clientId}")
    public Flux<AnnouncementResponseDTO> getAnnouncementsByClientId(@PathVariable UUID clientId) {
        return announcementService.getAnnouncementsByClientId(clientId);
    }

    @GetMapping("/{id}")
    public Mono<AnnouncementResponseDTO> getAnnouncement(@PathVariable UUID id) {
        return announcementService.getAnnouncement(id);
    }

    @PutMapping("/{id}")
    public Mono<AnnouncementResponseDTO> updateAnnouncement(@PathVariable UUID id,
            @RequestBody AnnouncementRequestDTO request) {
        return announcementService.updateAnnouncement(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteAnnouncement(@PathVariable UUID id) {
        return announcementService.deleteAnnouncement(id);
    }

    @PatchMapping("/{id}/publish")
    public Mono<AnnouncementResponseDTO> publishAnnouncement(@PathVariable UUID id) {
        return announcementService.publishAnnouncement(id);
    }
}
