package com.polytechnique.ticbnpick.models;

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
 * Represents a comment in the system.
 * Comments can be associated with deliveries or announcements.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("comments")
public class Comment {

    @Id
    @Column("id")
    private UUID id;

    @NotNull
    @Column("person_id")
    private UUID personId;

    @NotNull
    @Column("person_receiver_id")
    private UUID personReceiverId;

    @NotNull
    @Column("message")
    private String message;

    @Column("num_of_like")
    private Integer numOfLike;

    @Column("created_at")
    private Instant createdAt;
}
