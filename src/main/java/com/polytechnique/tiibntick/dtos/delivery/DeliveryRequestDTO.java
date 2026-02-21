package com.polytechnique.tiibntick.dtos.delivery;

import java.time.Instant;
import java.util.UUID;
import lombok.Data;

/**
 * DTO for delivery creation requests.
 *
 * @author François-Charles ATANGA
 * @date 21/02/2026
 *       Note: Created to handle delivery request data mapping.
 */
@Data
public class DeliveryRequestDTO {
    private UUID announcementId;
    private UUID deliveryPersonId;
    private Instant pickupMinTime;
}
