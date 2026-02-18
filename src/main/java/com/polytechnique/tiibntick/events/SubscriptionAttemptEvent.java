package com.polytechnique.tiibntick.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Event triggered when a delivery person attempts to subscribe to an
 * announcement.
 * Carries the necessary IDs and timestamp to be processed asynchronously by the
 * consumer.
 *
 * @author François-Charles ATANGA
 * @date 04/02/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionAttemptEvent {
    private UUID announcementId;
    private UUID deliveryPersonId;
    private Instant timestamp;
}
