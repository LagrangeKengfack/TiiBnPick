package com.polytechnique.tiibntick.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing the link (subscription) between a delivery person and an
 * announcement.
 * This table stores the candidacies of delivery persons for specific
 * announcements.
 *
 * @author François-Charles ATANGA
 * @date 04/02/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("announcement_subscriptions")
public class AnnouncementSubscription {

    @Id
    @Column("id")
    private UUID id;

    @Column("announcement_id")
    private UUID announcementId;

    @Column("delivery_person_id")
    private UUID deliveryPersonId;

    @Column("status")
    private String status; // ACCEPTED, REJECTED

    @Column("created_at")
    private Instant createdAt;
}
