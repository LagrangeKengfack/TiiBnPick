package com.polytechnique.tiibntick;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class ElasticsearchConnectionTest {

    @Autowired
    private ElasticsearchOperations elasticsearchOperations;

    @Autowired
    private org.springframework.data.elasticsearch.core.ReactiveElasticsearchOperations reactiveElasticsearchOperations;

    @Test
    public void testElasticsearchConnection() {
        assertThat(elasticsearchOperations).isNotNull();
        System.out
                .println("ElasticsearchOperations bean is available: " + elasticsearchOperations.getClass().getName());
        assertThat(reactiveElasticsearchOperations).isNotNull();
        System.out
                .println("ReactiveElasticsearchOperations bean is available: " + reactiveElasticsearchOperations.getClass().getName());
        
        // Test a simple reactive operation
        Boolean exists = reactiveElasticsearchOperations.indexOps(com.polytechnique.tiibntick.elasticsearch.models.AnnouncementDocument.class)
            .exists().block();
        System.out.println("Index exists: " + exists);

        // Try to save a dummy doc
        com.polytechnique.tiibntick.elasticsearch.models.AnnouncementDocument doc = com.polytechnique.tiibntick.elasticsearch.models.AnnouncementDocument.builder()
            .id(java.util.UUID.randomUUID())
            .clientId(java.util.UUID.randomUUID())
            .pickupLocation(new org.springframework.data.elasticsearch.core.geo.GeoPoint(48.8566, 2.3522))
            .deliveryLocation(new org.springframework.data.elasticsearch.core.geo.GeoPoint(45.7640, 4.8357))
            .packet(new com.polytechnique.tiibntick.dtos.packet.PacketDTO())
            .createdAt(java.time.Instant.now())
            .amount(100.0)
            .build();
        System.out.println("Saving document...");
        try {
            reactiveElasticsearchOperations.save(doc).block();
            System.out.println("Save successful!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
