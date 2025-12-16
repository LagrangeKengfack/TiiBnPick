package com.polytechnique.ticbnpick.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

/**
 * Driver entity.
 * Author: Kengfack Lagrange
 * Date: 16/12/2025
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("livreur")
public class Driver {

    @Id
    private UUID idLivreur;

    private String statut;
    private Float reputation;
    private String localisation;
    private String registreCommerce;
    private String nomCommercial;
    private String nui;
}