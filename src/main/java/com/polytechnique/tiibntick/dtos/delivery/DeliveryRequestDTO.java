package com.polytechnique.tiibntick.dtos.delivery;

import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
public class DeliveryRequestDTO {
    private UUID announcementId;
    private UUID deliveryPersonId;
    private Instant pickupMinTime;
}
