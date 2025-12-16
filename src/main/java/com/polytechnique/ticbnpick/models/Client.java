package com.polytechnique.ticbnpick.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

/**
 * Client entity.
 * Author: Kengfack Lagrange
 * Date: 16/12/2025
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("client")
public class Client {

    @Id
    private UUID idClient;

    private String statutFidelite;
    private Float noteMoyenne;
}