package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.port.in.AnnouncementUseCase;
import com.polytechnique.tiibntick.application.service.AnnouncementService;
import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementResponseDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.subscription.SubscriptionResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Application use case implementation for announcement management.
 * Bridges the shared DTOs (inbound port) to the existing AnnouncementService (legacy).
 */
@Service
@RequiredArgsConstructor
public class AnnouncementUseCaseImpl implements AnnouncementUseCase {

    private final AnnouncementService announcementService;

    @Override
    public Mono<AnnouncementResponseDTO> createAnnouncement(AnnouncementRequestDTO request) {
        return announcementService.createAnnouncement(convertRequest(request))
                .map(this::convertResponse);
    }

    @Override
    public Flux<AnnouncementResponseDTO> getAllAnnouncements() {
        return announcementService.getAllAnnouncements().map(this::convertResponse);
    }

    @Override
    public Mono<AnnouncementResponseDTO> getAnnouncement(UUID id) {
        return announcementService.getAnnouncement(id).map(this::convertResponse);
    }

    @Override
    public Flux<AnnouncementResponseDTO> getAnnouncementsByClientId(UUID clientId) {
        return announcementService.getAnnouncementsByClientId(clientId).map(this::convertResponse);
    }

    @Override
    public Mono<AnnouncementResponseDTO> updateAnnouncement(UUID id, AnnouncementRequestDTO request) {
        return announcementService.updateAnnouncement(id, convertRequest(request))
                .map(this::convertResponse);
    }

    @Override
    public Mono<Void> deleteAnnouncement(UUID id) {
        return announcementService.deleteAnnouncement(id);
    }

    @Override
    public Mono<AnnouncementResponseDTO> publishAnnouncement(UUID id) {
        return announcementService.publishAnnouncement(id).map(this::convertResponse);
    }

    @Override
    public Mono<Void> initiateSubscription(UUID announcementId, UUID deliveryPersonId) {
        return announcementService.initiateSubscription(announcementId, deliveryPersonId);
    }

    @Override
    public Flux<SubscriptionResponseDTO> getSubscriptionsForAnnouncement(UUID announcementId) {
        return announcementService.getSubscriptionsForAnnouncement(announcementId)
                .map(this::convertSubscriptionResponse);
    }

    @Override
    public Mono<AnnouncementResponseDTO> assignDeliveryPerson(UUID announcementId, UUID deliveryPersonId) {
        return announcementService.assignDeliveryPerson(announcementId, deliveryPersonId)
                .map(this::convertResponse);
    }

    @Override
    public Flux<AnnouncementResponseDTO> getSubscriptionsByDeliveryPersonId(UUID deliveryPersonId) {
        return announcementService.getSubscriptionsByDeliveryPersonId(deliveryPersonId)
                .map(this::convertResponse);
    }

    // ──────────────────────────────────────────────────
    // Conversion helpers: shared ↔ legacy DTOs
    // ──────────────────────────────────────────────────

    private com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementRequestDTO convertRequest(
            AnnouncementRequestDTO shared) {
        com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementRequestDTO legacy =
                new com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementRequestDTO();
        legacy.setClientId(shared.getClientId());
        legacy.setTitle(shared.getTitle());
        legacy.setDescription(shared.getDescription());
        legacy.setRecipientFirstName(shared.getRecipientFirstName());
        legacy.setRecipientLastName(shared.getRecipientLastName());
        legacy.setRecipientEmail(shared.getRecipientEmail());
        legacy.setRecipientPhone(shared.getRecipientPhone());
        legacy.setShipperFirstName(shared.getShipperFirstName());
        legacy.setShipperLastName(shared.getShipperLastName());
        legacy.setShipperEmail(shared.getShipperEmail());
        legacy.setShipperPhone(shared.getShipperPhone());
        legacy.setAmount(shared.getAmount());
        legacy.setSignatureUrl(shared.getSignatureUrl());
        legacy.setPaymentMethod(shared.getPaymentMethod());
        legacy.setTransportMethod(shared.getTransportMethod());
        legacy.setDistance(shared.getDistance());
        legacy.setDuration(shared.getDuration());
        legacy.setAutoPublish(shared.getAutoPublish());

        if (shared.getPickupAddress() != null) {
            legacy.setPickupAddress(convertAddressDTO(shared.getPickupAddress()));
        }
        if (shared.getDeliveryAddress() != null) {
            legacy.setDeliveryAddress(convertAddressDTO(shared.getDeliveryAddress()));
        }
        if (shared.getPacket() != null) {
            legacy.setPacket(convertPacketDTO(shared.getPacket()));
        }
        return legacy;
    }

    private com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO convertAddressDTO(
            com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO shared) {
        com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO legacy =
                new com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO();
        legacy.setStreet(shared.getStreet());
        legacy.setCity(shared.getCity());
        legacy.setDistrict(shared.getDistrict());
        legacy.setCountry(shared.getCountry());
        legacy.setDescription(shared.getDescription());
        legacy.setType(shared.getType());
        legacy.setLatitude(shared.getLatitude());
        legacy.setLongitude(shared.getLongitude());
        return legacy;
    }

    private com.polytechnique.tiibntick.infrastructure.web.dto.packet.PacketDTO convertPacketDTO(
            com.polytechnique.tiibntick.infrastructure.web.dto.packet.PacketDTO shared) {
        com.polytechnique.tiibntick.infrastructure.web.dto.packet.PacketDTO legacy =
                new com.polytechnique.tiibntick.infrastructure.web.dto.packet.PacketDTO();
        legacy.setWeight(shared.getWeight());
        legacy.setWidth(shared.getWidth());
        legacy.setHeight(shared.getHeight());
        legacy.setLength(shared.getLength());
        legacy.setFragile(shared.getFragile());
        legacy.setDescription(shared.getDescription());
        legacy.setPhotoPacket(shared.getPhotoPacket());
        legacy.setIsPerishable(shared.getIsPerishable());
        legacy.setThickness(shared.getThickness());
        legacy.setDesignation(shared.getDesignation());
        return legacy;
    }

    private AnnouncementResponseDTO convertResponse(
            com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementResponseDTO legacy) {
        AnnouncementResponseDTO dto = new AnnouncementResponseDTO();
        dto.setId(legacy.getId());
        dto.setClientId(legacy.getClientId());
        dto.setTitle(legacy.getTitle());
        dto.setDescription(legacy.getDescription());
        dto.setStatus(legacy.getStatus());
        dto.setCreatedAt(legacy.getCreatedAt());
        dto.setUpdatedAt(legacy.getUpdatedAt());
        dto.setRecipientFirstName(legacy.getRecipientFirstName());
        dto.setRecipientLastName(legacy.getRecipientLastName());
        dto.setRecipientEmail(legacy.getRecipientEmail());
        dto.setRecipientPhone(legacy.getRecipientPhone());
        dto.setShipperFirstName(legacy.getShipperFirstName());
        dto.setShipperLastName(legacy.getShipperLastName());
        dto.setShipperEmail(legacy.getShipperEmail());
        dto.setShipperPhone(legacy.getShipperPhone());
        dto.setAmount(legacy.getAmount());
        dto.setSignatureUrl(legacy.getSignatureUrl());
        dto.setPaymentMethod(legacy.getPaymentMethod());
        dto.setTransportMethod(legacy.getTransportMethod());
        dto.setDistance(legacy.getDistance());
        dto.setDuration(legacy.getDuration());
        dto.setAssignedDeliveryPersonId(legacy.getAssignedDeliveryPersonId());
        dto.setAssignedDeliveryPersonFirstName(legacy.getAssignedDeliveryPersonFirstName());
        dto.setAssignedDeliveryPersonLastName(legacy.getAssignedDeliveryPersonLastName());
        dto.setAssignedDeliveryPersonEmail(legacy.getAssignedDeliveryPersonEmail());
        dto.setAssignedDeliveryPersonPhone(legacy.getAssignedDeliveryPersonPhone());

        if (legacy.getPickupAddress() != null) {
            com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO addr =
                    new com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO();
            addr.setStreet(legacy.getPickupAddress().getStreet());
            addr.setCity(legacy.getPickupAddress().getCity());
            addr.setDistrict(legacy.getPickupAddress().getDistrict());
            addr.setCountry(legacy.getPickupAddress().getCountry());
            addr.setDescription(legacy.getPickupAddress().getDescription());
            addr.setType(legacy.getPickupAddress().getType());
            addr.setLatitude(legacy.getPickupAddress().getLatitude());
            addr.setLongitude(legacy.getPickupAddress().getLongitude());
            dto.setPickupAddress(addr);
        }
        if (legacy.getDeliveryAddress() != null) {
            com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO addr =
                    new com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO();
            addr.setStreet(legacy.getDeliveryAddress().getStreet());
            addr.setCity(legacy.getDeliveryAddress().getCity());
            addr.setDistrict(legacy.getDeliveryAddress().getDistrict());
            addr.setCountry(legacy.getDeliveryAddress().getCountry());
            addr.setDescription(legacy.getDeliveryAddress().getDescription());
            addr.setType(legacy.getDeliveryAddress().getType());
            addr.setLatitude(legacy.getDeliveryAddress().getLatitude());
            addr.setLongitude(legacy.getDeliveryAddress().getLongitude());
            dto.setDeliveryAddress(addr);
        }
        if (legacy.getPacket() != null) {
            com.polytechnique.tiibntick.infrastructure.web.dto.packet.PacketDTO pkt =
                    new com.polytechnique.tiibntick.infrastructure.web.dto.packet.PacketDTO();
            pkt.setWeight(legacy.getPacket().getWeight());
            pkt.setWidth(legacy.getPacket().getWidth());
            pkt.setHeight(legacy.getPacket().getHeight());
            pkt.setLength(legacy.getPacket().getLength());
            pkt.setFragile(legacy.getPacket().getFragile());
            pkt.setDescription(legacy.getPacket().getDescription());
            pkt.setPhotoPacket(legacy.getPacket().getPhotoPacket());
            pkt.setIsPerishable(legacy.getPacket().getIsPerishable());
            pkt.setThickness(legacy.getPacket().getThickness());
            pkt.setDesignation(legacy.getPacket().getDesignation());
            dto.setPacket(pkt);
        }
        return dto;
    }

    private SubscriptionResponseDTO convertSubscriptionResponse(
            com.polytechnique.tiibntick.infrastructure.web.dto.subscription.SubscriptionResponseDTO legacy) {
        SubscriptionResponseDTO dto = new SubscriptionResponseDTO();
        dto.setSubscriptionId(legacy.getSubscriptionId());
        dto.setDeliveryPersonId(legacy.getDeliveryPersonId());
        dto.setFirstName(legacy.getFirstName());
        dto.setLastName(legacy.getLastName());
        dto.setEmail(legacy.getEmail());
        dto.setPhone(legacy.getPhone());
        dto.setRating(legacy.getRating());
        dto.setStatus(legacy.getStatus());
        dto.setCreatedAt(legacy.getCreatedAt());
        return dto;
    }
}
