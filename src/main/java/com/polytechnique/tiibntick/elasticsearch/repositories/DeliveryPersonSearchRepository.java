package com.polytechnique.tiibntick.elasticsearch.repositories;

import com.polytechnique.tiibntick.elasticsearch.models.DeliveryPersonDocument;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.geo.Distance;
import org.springframework.data.elasticsearch.repository.ReactiveElasticsearchRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

/**
 * Reactive Repository for accessing DeliveryPerson documents in Elasticsearch.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@Repository
public interface DeliveryPersonSearchRepository extends ReactiveElasticsearchRepository<DeliveryPersonDocument, UUID> {
    Flux<DeliveryPersonDocument> findByIsAvailableTrueAndIsActiveTrueAndLocationNear(GeoPoint location,
            Distance distance);
}
