package com.polytechnique.ticbnpick.dtos.announcement;

import com.polytechnique.ticbnpick.dtos.address.AddressDTO;
import com.polytechnique.ticbnpick.dtos.packet.PacketDTO;
import com.polytechnique.ticbnpick.models.enums.announcement.AnnouncementStatus;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

<<<<<<< HEAD
=======
/**
 * DTO representing the response for an announcement.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 *       Note: Added explicit setters for complex objects (pickupAddress,
 *       deliveryAddress, packet)
 *       to resolve mapping issues where Lombok setters were not being detected
 *       correctly.
 */
>>>>>>> subscription
@Data
public class AnnouncementResponseDTO {
    private UUID id;
    private UUID clientId;
    private String title;
    private String description;
    private AnnouncementStatus status;
    private Double price;
    private Instant createdAt;
    private Instant updatedAt;
    private String recipientName;
    private String recipientNumber;
    private Float amount;
<<<<<<< HEAD
    
    private AddressDTO pickupAddress;
    private AddressDTO deliveryAddress;
    private PacketDTO packet;
=======

    private AddressDTO pickupAddress;
    private AddressDTO deliveryAddress;
    private PacketDTO packet;

    public void setPickupAddress(AddressDTO pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public void setDeliveryAddress(AddressDTO deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public void setPacket(PacketDTO packet) {
        this.packet = packet;
    }
>>>>>>> subscription
}
