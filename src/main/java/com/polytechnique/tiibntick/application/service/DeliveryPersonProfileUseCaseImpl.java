package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.port.in.DeliveryPersonProfileUseCase;
import com.polytechnique.tiibntick.application.service.DeliveryPersonProfileService;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonUpdateRequest;
import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonDetailsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Application use case implementation for delivery person profile management.
 * Delegates to the existing DeliveryPersonProfileService.
 */
@Service
@RequiredArgsConstructor
public class DeliveryPersonProfileUseCaseImpl implements DeliveryPersonProfileUseCase {

    private final DeliveryPersonProfileService profileService;

    @Override
    public Mono<DeliveryPersonDetailsResponse> getProfile(UUID id) {
        return profileService.getProfile(id)
                .map(this::convertDetailsResponse);
    }

    @Override
    public Mono<Void> updateProfile(UUID id, DeliveryPersonUpdateRequest request) {
        // Convert shared DTO to legacy DTO for the existing service
        com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonUpdateRequest legacyRequest =
                convertUpdateRequest(request);
        return profileService.updateProfile(id, legacyRequest);
    }

    @Override
    public Mono<Void> deleteProfile(UUID id) {
        return profileService.deleteProfile(id);
    }

    /**
     * Converts the legacy DeliveryPersonDetailsResponse to the shared DTO.
     * Currently the same structure — maps field by field.
     */
    private DeliveryPersonDetailsResponse convertDetailsResponse(
            com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonDetailsResponse legacy) {
        DeliveryPersonDetailsResponse dto = new DeliveryPersonDetailsResponse();
        dto.setId(legacy.getId());
        dto.setFirstName(legacy.getFirstName());
        dto.setLastName(legacy.getLastName());
        dto.setEmail(legacy.getEmail());
        dto.setPhone(legacy.getPhone());
        dto.setStatus(legacy.getStatus());
        dto.setCommercialName(legacy.getCommercialName());
        dto.setNuiNumber(legacy.getNuiNumber());
        dto.setNuiPhoto(legacy.getNuiPhoto());
        dto.setStreet(legacy.getStreet());
        dto.setCity(legacy.getCity());
        dto.setNationalId(legacy.getNationalId());
        dto.setPhotoCard(legacy.getPhotoCard());
        dto.setCniRecto(legacy.getCniRecto());
        dto.setCniVerso(legacy.getCniVerso());
        dto.setIdCardVerified(legacy.getIdCardVerified());
        dto.setVehicleType(legacy.getVehicleType());
        dto.setVehicleBrand(legacy.getVehicleBrand());
        dto.setVehicleModel(legacy.getVehicleModel());
        dto.setVehicleRegNumber(legacy.getVehicleRegNumber());
        dto.setVehicleColor(legacy.getVehicleColor());
        dto.setVehicleFrontPhoto(legacy.getVehicleFrontPhoto());
        dto.setVehicleBackPhoto(legacy.getVehicleBackPhoto());
        dto.setVehicleRegVerified(legacy.getVehicleRegVerified());
        dto.setInsuranceVerified(legacy.getInsuranceVerified());
        dto.setCreatedAt(legacy.getCreatedAt());
        dto.setUpdatedAt(legacy.getUpdatedAt());
        return dto;
    }

    /**
     * Converts the shared DeliveryPersonUpdateRequest to the legacy DTO.
     */
    private com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonUpdateRequest convertUpdateRequest(
            DeliveryPersonUpdateRequest shared) {
        com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonUpdateRequest legacy =
                new com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonUpdateRequest();
        legacy.setFirstName(shared.getFirstName());
        legacy.setLastName(shared.getLastName());
        legacy.setEmail(shared.getEmail());
        legacy.setPhone(shared.getPhone());
        legacy.setPassword(shared.getPassword());
        legacy.setCommercialName(shared.getCommercialName());
        legacy.setCommercialRegister(shared.getCommercialRegister());
        legacy.setLogisticsType(shared.getLogisticsType());
        legacy.setBackPhoto(shared.getBackPhoto());
        legacy.setFrontPhoto(shared.getFrontPhoto());
        legacy.setPlateNumber(shared.getPlateNumber());
        legacy.setLogisticsClass(shared.getLogisticsClass());
        legacy.setColor(shared.getColor());
        legacy.setTankCapacity(shared.getTankCapacity());
        legacy.setLength(shared.getLength());
        legacy.setWidth(shared.getWidth());
        legacy.setHeight(shared.getHeight());
        legacy.setUnit(shared.getUnit());
        legacy.setTotalSeatNumber(shared.getTotalSeatNumber());
        legacy.setStreet(shared.getStreet());
        legacy.setCity(shared.getCity());
        legacy.setDistrict(shared.getDistrict());
        legacy.setCountry(shared.getCountry());
        legacy.setDescription(shared.getDescription());
        return legacy;
    }
}
