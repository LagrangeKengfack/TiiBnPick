package com.polytechnique.tiibntick.dtos.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for completing a delivery with actual metrics.
 *
 * @author François-Charles ATANGA
 * @date 22/02/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteDeliveryRequestDTO {
    private Integer actualDuration;
    private Double actualDistanceKm;
}
