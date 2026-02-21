package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.delivery.DeliveryRequestDTO;
import com.polytechnique.tiibntick.dtos.delivery.DeliveryResponseDTO;
import com.polytechnique.tiibntick.models.enums.delivery.DeliveryStatus;
import com.polytechnique.tiibntick.services.DeliveryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf;

/**
 * Unit tests for DeliveryController.
 *
 * @author François-Charles ATANGA
 * @date 21/02/2026
 *       Note: Tests the creation, failure reporting, and cancellation
 *       endpoints of the delivery management system.
 */
@WebFluxTest(controllers = DeliveryController.class)
class DeliveryControllerTest {

        @Autowired
        private WebTestClient webTestClient;

        @MockBean
        private DeliveryService deliveryService;

        @Test
        @WithMockUser
        void createDelivery_Success() {
                UUID announcementId = UUID.randomUUID();
                UUID deliveryPersonId = UUID.randomUUID();

                DeliveryRequestDTO request = new DeliveryRequestDTO();
                request.setAnnouncementId(announcementId);
                request.setDeliveryPersonId(deliveryPersonId);
                request.setPickupMinTime(Instant.now());

                DeliveryResponseDTO response = new DeliveryResponseDTO();
                response.setId(UUID.randomUUID());
                response.setStatus(DeliveryStatus.CREATED);

                when(deliveryService.createDelivery(any(DeliveryRequestDTO.class)))
                                .thenReturn(Mono.just(response));

                webTestClient.mutateWith(csrf())
                                .post().uri("/api/deliveries")
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(request)
                                .exchange()
                                .expectStatus().isCreated()
                                .expectBody()
                                .jsonPath("$.status").isEqualTo("CREATED");
        }

        @Test
        @WithMockUser
        void failDelivery_Success() {
                UUID deliveryId = UUID.randomUUID();
                DeliveryResponseDTO response = new DeliveryResponseDTO();
                response.setId(deliveryId);
                response.setStatus(DeliveryStatus.FAILED);

                when(deliveryService.failDelivery(deliveryId))
                                .thenReturn(Mono.just(response));

                webTestClient.mutateWith(csrf())
                                .post().uri("/api/deliveries/{id}/fail", deliveryId)
                                .exchange()
                                .expectStatus().isOk()
                                .expectBody()
                                .jsonPath("$.status").isEqualTo("FAILED");
        }

        @Test
        @WithMockUser
        void cancelDelivery_Success() {
                UUID deliveryId = UUID.randomUUID();
                DeliveryResponseDTO response = new DeliveryResponseDTO();
                response.setId(deliveryId);
                response.setStatus(DeliveryStatus.CANCELLED);

                when(deliveryService.cancelDelivery(deliveryId))
                                .thenReturn(Mono.just(response));

                webTestClient.mutateWith(csrf())
                                .post().uri("/api/deliveries/{id}/cancel", deliveryId)
                                .exchange()
                                .expectStatus().isOk()
                                .expectBody()
                                .jsonPath("$.status").isEqualTo("CANCELLED");
        }
}
