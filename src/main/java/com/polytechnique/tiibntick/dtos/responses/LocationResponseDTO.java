package com.polytechnique.tiibntick.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for location coordinates.
 *
 * @author François-Charles ATANGA
 * @date 21/02/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponseDTO {
    private Double latitude;
    private Double longitude;
}
