package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.elasticsearch.models.DeliveryPersonDocument;
import com.polytechnique.ticbnpick.elasticsearch.repositories.DeliveryPersonSearchRepository;
import com.polytechnique.ticbnpick.services.deliveryperson.LectureDeliveryPersonService;
import com.polytechnique.ticbnpick.services.person.LecturePersonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Service handling updating of Delivery Person location and synchronization
 * with Elasticsearch.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryPersonLocationService {

    private final DeliveryPersonSearchRepository deliveryPersonSearchRepository;
    private final LectureDeliveryPersonService lectureDeliveryPersonService;
    private final LecturePersonService lecturePersonService;

    /**
     * Updates the location of a delivery person.
     * Fetches current details from SQL DB to ensure the Elasticsearch document is
     * fully populated/updated.
     *
     * @param deliveryPersonId ID of the delivery person
     * @param latitude         New latitude
     * @param longitude        New longitude
     * @return Mono<Void>
     */
    public Mono<Void> updateLocation(UUID deliveryPersonId, Double latitude, Double longitude) {
        return lectureDeliveryPersonService.findById(deliveryPersonId)
                .switchIfEmpty(
                        Mono.error(new RuntimeException("Delivery Person not found with ID: " + deliveryPersonId)))
                .flatMap(deliveryPerson -> lecturePersonService.findById(deliveryPerson.getPersonId())
                        .flatMap(person -> {

                            DeliveryPersonDocument document = DeliveryPersonDocument.builder()
                                    .id(deliveryPerson.getId())
                                    .location(new GeoPoint(latitude, longitude))
                                    .firstName(person.getFirstName())
                                    .lastName(person.getLastName())
                                    .email(person.getEmail())
                                    .phone(person.getPhone())
                                    .commercialName(deliveryPerson.getCommercialName())
                                    .status(deliveryPerson.getStatus() != null ? deliveryPerson.getStatus().toString()
                                            : null)
                                    .isActive(deliveryPerson.getIsActive())
                                    .isAvailable(true) // Assuming active update implies availability, logic can be
                                                       // refined
                                    .build();

                            return deliveryPersonSearchRepository.save(document);
                        }))
                .doOnSuccess(doc -> log.debug("Updated location for delivery person {}", deliveryPersonId))
                .doOnError(e -> log.error("Failed to update location for delivery person {}", deliveryPersonId, e))
                .then();
    }
}
