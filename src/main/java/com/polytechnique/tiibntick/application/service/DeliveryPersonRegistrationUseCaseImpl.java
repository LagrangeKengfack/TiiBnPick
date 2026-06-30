package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.port.in.DeliveryPersonRegistrationUseCase;
import com.polytechnique.tiibntick.application.service.DeliveryPersonRegistrationService;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonRegistrationRequest;
import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonRegistrationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * Application use case implementation for delivery person registration.
 * Delegates to the existing DeliveryPersonRegistrationService.
 */
@Service
@RequiredArgsConstructor
public class DeliveryPersonRegistrationUseCaseImpl implements DeliveryPersonRegistrationUseCase {

    private final DeliveryPersonRegistrationService registrationService;

    @Override
    public Mono<DeliveryPersonRegistrationResponse> register(
            DeliveryPersonRegistrationRequest request,
            FilePart photoCard, FilePart cniRecto, FilePart cniVerso,
            FilePart nuiPhoto, FilePart frontPhoto, FilePart backPhoto, FilePart storefrontPhoto) {

        // Convert shared DTO to legacy DTO
        com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonRegistrationRequest legacyRequest =
                convertRequest(request);

        return registrationService.register(legacyRequest, photoCard, cniRecto, cniVerso, nuiPhoto, frontPhoto, backPhoto, storefrontPhoto)
                .map(legacyResponse -> {
                    DeliveryPersonRegistrationResponse response = new DeliveryPersonRegistrationResponse();
                    response.setDeliveryPersonId(legacyResponse.getDeliveryPersonId());
                    response.setStatus(legacyResponse.getStatus());
                    return response;
                });
    }

    private com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonRegistrationRequest convertRequest(
            DeliveryPersonRegistrationRequest shared) {
        com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonRegistrationRequest legacy =
                new com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonRegistrationRequest();
        legacy.setLastName(shared.getLastName());
        legacy.setFirstName(shared.getFirstName());
        legacy.setPhone(shared.getPhone());
        legacy.setEmail(shared.getEmail());
        legacy.setNationalId(shared.getNationalId());
        legacy.setPhotoCard(shared.getPhotoCard());
        legacy.setCommercialRegister(shared.getCommercialRegister());
        legacy.setCommercialName(shared.getCommercialName());
        legacy.setNui(shared.getNui());
        legacy.setNuiPhoto(shared.getNuiPhoto());
        legacy.setCniRecto(shared.getCniRecto());
        legacy.setCniVerso(shared.getCniVerso());
        legacy.setCommissionRate(shared.getCommissionRate());
        legacy.setSiret(shared.getSiret());
        legacy.setPassword(shared.getPassword());
        legacy.setPlateNumber(shared.getPlateNumber());
        legacy.setLogisticsType(shared.getLogisticsType());
        legacy.setLogisticsClass(shared.getLogisticsClass());
        legacy.setBackPhoto(shared.getBackPhoto());
        legacy.setFrontPhoto(shared.getFrontPhoto());
        legacy.setStorefrontPhoto(shared.getStorefrontPhoto());
        legacy.setTankCapacity(shared.getTankCapacity());
        legacy.setLength(shared.getLength());
        legacy.setWidth(shared.getWidth());
        legacy.setHeight(shared.getHeight());
        legacy.setUnit(shared.getUnit());
        legacy.setTotalSeatNumber(shared.getTotalSeatNumber());
        legacy.setColor(shared.getColor());
        legacy.setOpeningHours(shared.getOpeningHours());
        legacy.setStreet(shared.getStreet());
        legacy.setCity(shared.getCity());
        legacy.setDistrict(shared.getDistrict());
        legacy.setCountry(shared.getCountry());
        legacy.setDescription(shared.getDescription());
        return legacy;
    }
}
