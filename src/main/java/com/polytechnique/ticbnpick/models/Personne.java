package com.polytechnique.ticbnpick.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

/**
 * Person entity.
 *
 * Represents a physical person (client or driver).
 *
 * Author: Kengfack Lagrange
 * Date: 16/12/2025
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("personne")
public class Personne {

    @Id
    @Column("id_personne")
    private UUID idPersonne;

    @Column("full_name")
    private String fullName;

    @Column("telephone")
    private String telephone;

    @Column("email")
    private String email;

    @Column("password_hash")
    private String passwordHash;

    @Column("cni")
    private String cni;

    @Column("photo")
    private String photo;

    @Column("extrait_casier")
    private String extraitCasier;
}