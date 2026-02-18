package com.polytechnique.ticbnpick.models;

import com.polytechnique.ticbnpick.models.enums.payment.PaymentMethod;
import com.polytechnique.ticbnpick.models.enums.subscription.SubscriptionStatus;
import com.polytechnique.ticbnpick.models.enums.subscription.SubscriptionType;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

/**
 * Represents a subscription for a delivery person.
 * Subscriptions define the level of service and features available.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("subscriptions")
public class Subscription {

    @Id
    @Column("id")
    private UUID id;

    @NotNull
    @Column("subscription_type")
    private SubscriptionType subscriptionType;

    @NotNull
    @Column("status")
    private SubscriptionStatus status;

    @NotNull
    @Column("start_date")
    private Instant startDate;

    @Column("end_date")
    private Instant endDate;

    @NotNull
    @Column("price")
    private Float price;

    @NotNull
    @Column("payment_method")
    private PaymentMethod paymentMethod;
}
