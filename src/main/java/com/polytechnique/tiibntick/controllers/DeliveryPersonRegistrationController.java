package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.requests.DeliveryPersonRegistrationRequest;
import com.polytechnique.tiibntick.dtos.responses.DeliveryPersonRegistrationResponse;
import com.polytechnique.tiibntick.services.DeliveryPersonRegistrationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * Controller for delivery person registration.
 *
 * <p>Accepts multipart/form-data: JSON text fields + binary photo files.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Slf4j
@RestController
@RequestMapping("/api/delivery-persons")
@RequiredArgsConstructor
public class DeliveryPersonRegistrationController {

    private final DeliveryPersonRegistrationService registrationService;
    private final ObjectMapper objectMapper;

    /**
     * Registers a new delivery person using multipart upload.
     *
     * @param jsonData   JSON string with text fields (parsed to DeliveryPersonRegistrationRequest)
     * @param photoCard  photo d'identité (optional)
     * @param cniRecto   CNI recto (optional)
     * @param cniVerso   CNI verso (optional)
     * @param nuiPhoto   NUI photo (optional)
     * @param frontPhoto vehicle front photo (optional)
     * @param backPhoto  vehicle back photo (optional)
     * @return 201 Created with registration response
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<DeliveryPersonRegistrationResponse>> register(
            @RequestPart("data") String jsonData,
            @RequestPart(value = "photoCard", required = false) FilePart photoCard,
            @RequestPart(value = "cniRecto", required = false) FilePart cniRecto,
            @RequestPart(value = "cniVerso", required = false) FilePart cniVerso,
            @RequestPart(value = "nuiPhoto", required = false) FilePart nuiPhoto,
            @RequestPart(value = "frontPhoto", required = false) FilePart frontPhoto,
            @RequestPart(value = "backPhoto", required = false) FilePart backPhoto) {

        DeliveryPersonRegistrationRequest request;
        try {
            request = objectMapper.readValue(jsonData, DeliveryPersonRegistrationRequest.class);
        } catch (Exception e) {
            log.error("Failed to parse registration JSON data", e);
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return registrationService.register(request, photoCard, cniRecto, cniVerso, nuiPhoto, frontPhoto, backPhoto)
                .map(response -> ResponseEntity.status(HttpStatus.CREATED).body(response));
    }
}
