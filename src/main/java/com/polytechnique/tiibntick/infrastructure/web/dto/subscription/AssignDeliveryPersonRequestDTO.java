package com.polytechnique.tiibntick.infrastructure.web.dto.subscription;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for assigning a delivery person to an announcement.
 *
 * @author TiiBnTickTeam
 * @date 23/02/2026
 */
@Data
@NoArgsConstructor
public class AssignDeliveryPersonRequestDTO {
    private UUID deliveryPersonId;
}
