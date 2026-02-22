package com.polytechnique.tiibntick.dtos.subscription;

import com.polytechnique.tiibntick.models.enums.payment.PaymentMethod;
import com.polytechnique.tiibntick.models.enums.subscription.SubscriptionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating a new subscription plan and associating it with a delivery
 * person.
 *
 * @author François-Charles ATANGA
 * @date 22/02/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanRequestDTO {
    private UUID deliveryPersonId;
    private SubscriptionType subscriptionType;
    private PaymentMethod paymentMethod;
    private Float price;
}
