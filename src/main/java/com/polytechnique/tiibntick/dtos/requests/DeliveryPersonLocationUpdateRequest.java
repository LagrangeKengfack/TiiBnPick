package com.polytechnique.tiibntick.dtos.requests;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating delivery person's location.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPersonLocationUpdateRequest {

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;
}
