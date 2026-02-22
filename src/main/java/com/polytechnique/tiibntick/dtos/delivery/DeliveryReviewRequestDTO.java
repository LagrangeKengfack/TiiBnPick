package com.polytechnique.tiibntick.dtos.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for delivery reviews.
 *
 * @author François-Charles ATANGA
 * @date 22/02/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryReviewRequestDTO {
    private String message;
    private Double note;
}
