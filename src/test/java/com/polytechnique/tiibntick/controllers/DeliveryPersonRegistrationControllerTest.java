package com.polytechnique.tiibntick.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polytechnique.tiibntick.dtos.requests.DeliveryPersonRegistrationRequest;
import com.polytechnique.tiibntick.dtos.responses.DeliveryPersonRegistrationResponse;
import com.polytechnique.tiibntick.models.enums.logistics.LogisticsClass;
import com.polytechnique.tiibntick.models.enums.logistics.LogisticsType;
import com.polytechnique.tiibntick.services.DeliveryPersonRegistrationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf;

@WebFluxTest(controllers = DeliveryPersonRegistrationController.class)
class DeliveryPersonRegistrationControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeliveryPersonRegistrationService registrationService;

    @Test
    @WithMockUser
    void register_Success() throws Exception {
        DeliveryPersonRegistrationRequest request = new DeliveryPersonRegistrationRequest();
        request.setLastName("Doe");
        request.setFirstName("John");
        request.setPhone("123456789");
        request.setEmail("john.doe@example.com");
        request.setPassword("password");
        request.setLogisticsType(LogisticsType.BIKE.getValue());
        request.setLogisticsClass(LogisticsClass.STANDARD.getValue());
        request.setPlateNumber("AB-123-CD");

        DeliveryPersonRegistrationResponse response = new DeliveryPersonRegistrationResponse();
        response.setDeliveryPersonId(UUID.randomUUID());
        response.setStatus("PENDING");

        when(registrationService.register(
                any(DeliveryPersonRegistrationRequest.class),
                any(), any(), any(), any(), any(), any()))
                .thenReturn(Mono.just(response));

        String jsonData = objectMapper.writeValueAsString(request);

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("data", jsonData, MediaType.APPLICATION_JSON);

        webTestClient.mutateWith(csrf())
                .post().uri("/api/delivery-persons/register")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .bodyValue(builder.build())
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.status").isEqualTo("PENDING");
    }

    @Test
    @WithMockUser
    void register_ValidationFailure() {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("data", "{}", MediaType.APPLICATION_JSON);

        webTestClient.mutateWith(csrf())
                .post().uri("/api/delivery-persons/register")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .bodyValue(builder.build())
                .exchange()
                .expectStatus().isBadRequest();
    }
}
