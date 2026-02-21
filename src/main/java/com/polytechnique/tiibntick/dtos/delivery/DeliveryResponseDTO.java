package com.polytechnique.tiibntick.dtos.delivery;

import com.polytechnique.tiibntick.models.enums.delivery.DeliveryStatus;
import com.polytechnique.tiibntick.models.enums.delivery.DeliveryUrgency;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
public class DeliveryResponseDTO {
    private UUID id;
    private UUID announcementId;
    private UUID deliveryPersonId;
    private DeliveryStatus status;
    private Integer tarif;
    private Double noteLivreur;
    private Instant pickupMinTime;
    private Instant pickupMaxTime;
    private DeliveryUrgency urgency;
    private Instant deliveryMinTime;
    private Instant deliveryMaxTime;
    private Instant estimatedDelivery;
    private Integer duration;
    private Double deliveryNote;
    private Double distanceKm;
}
