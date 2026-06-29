package com.polytechnique.tiibntick.infrastructure.web.dto.announcement;

import com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.packet.PacketDTO;
import java.util.UUID;
import lombok.Data;

@Data
public class AnnouncementRequestDTO {
    private UUID clientId;
    private String title;
    private String description;
    private String recipientFirstName;
    private String recipientLastName;
    private String recipientEmail;
    private String recipientPhone;
    private String shipperFirstName;
    private String shipperLastName;
    private String shipperEmail;
    private String shipperPhone;
    private Double amount;
    private String signatureUrl;
    private String paymentMethod;
    private String transportMethod;
    private Double distance;
    private Integer duration;
    private Boolean autoPublish;

    private AddressDTO pickupAddress;
    private AddressDTO deliveryAddress;
    private PacketDTO packet;
}
