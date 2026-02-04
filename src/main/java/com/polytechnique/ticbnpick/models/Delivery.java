package com.polytechnique.ticbnpick.models;

import com.polytechnique.ticbnpick.models.enums.delivery.DeliveryStatus;
import com.polytechnique.ticbnpick.models.enums.delivery.DeliveryUrgency;
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
 * Represents a delivery execution.
 * Time windows are defined using minimum and maximum bounds.
 *
 * @author Kengfack Lagrange
 * @date 17/12/2025
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("deliveries")
public class Delivery {

    @Id
    @Column("id")
    private UUID id;

    @NotNull
    @Column("announcement_id")
    private UUID announcementId;

    @NotNull
    @Column("delivery_person_id")
    private UUID deliveryPersonId;

    @NotNull
    @Column("status")
    private DeliveryStatus status;

    @Column("tarif")
    private Integer tarif;

    @Column("note_livreur")
    private Float noteLivreur;

    @NotNull
    @Column("pickup_min_time")
    private Instant pickupMinTime;

    @NotNull
    @Column("pickup_max_time")
    private Instant pickupMaxTime;

    @NotNull
    @Column("urgency")
    private DeliveryUrgency urgency;

    @NotNull
    @Column("delivery_min_time")
    private Instant deliveryMinTime;

    @NotNull
    @Column("delivery_max_time")
    private Instant deliveryMaxTime;

    @Column("estimated_delivery")
    private Instant estimatedDelivery;

<<<<<<< HEAD
=======
    @Column("duration")
    private Integer duration;

>>>>>>> subscription
    @Column("delivery_note")
    private Double deliveryNote;

    @Column("distance_km")
    private Double distanceKm;
}