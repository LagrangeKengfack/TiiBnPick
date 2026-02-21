package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.elasticsearch.models.DeliveryPersonDocument;
import com.polytechnique.tiibntick.elasticsearch.repositories.DeliveryPersonSearchRepository;
import com.polytechnique.tiibntick.models.Logistics;
import com.polytechnique.tiibntick.repositories.DeliveryPersonRepository;
import com.polytechnique.tiibntick.services.deliveryperson.LectureDeliveryPersonService;
import com.polytechnique.tiibntick.services.logistics.LectureLogisticsService;
import com.polytechnique.tiibntick.services.person.LecturePersonService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Optional;
import java.util.UUID;

/**
 * Service handling updating of Delivery Person location.
 * Always persists to SQL DB. Optionally syncs to Elasticsearch if available.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@Slf4j
@Service
public class DeliveryPersonLocationService {

        private final DeliveryPersonSearchRepository deliveryPersonSearchRepository;
        private final DeliveryPersonRepository deliveryPersonRepository;
        private final LectureDeliveryPersonService lectureDeliveryPersonService;
        private final LecturePersonService lecturePersonService;
        private final LectureLogisticsService lectureLogisticsService;

        public DeliveryPersonLocationService(
                        Optional<DeliveryPersonSearchRepository> deliveryPersonSearchRepository,
                        DeliveryPersonRepository deliveryPersonRepository,
                        LectureDeliveryPersonService lectureDeliveryPersonService,
                        LecturePersonService lecturePersonService,
                        LectureLogisticsService lectureLogisticsService) {
                this.deliveryPersonSearchRepository = deliveryPersonSearchRepository.orElse(null);
                this.deliveryPersonRepository = deliveryPersonRepository;
                this.lectureDeliveryPersonService = lectureDeliveryPersonService;
                this.lecturePersonService = lecturePersonService;
                this.lectureLogisticsService = lectureLogisticsService;
        }

        /**
         * Updates the location of a delivery person.
         * 1. Always saves latitude/longitude to the SQL database.
         * 2. Optionally syncs to Elasticsearch if available.
         *
         * @param deliveryPersonId ID of the delivery person
         * @param latitude         New latitude
         * @param longitude        New longitude
         * @return Mono<Void>
         */
        public Mono<Void> updateLocation(UUID deliveryPersonId, Double latitude, Double longitude) {
                return lectureDeliveryPersonService.findById(deliveryPersonId)
                                .switchIfEmpty(
                                                Mono.error(new RuntimeException("Delivery Person not found with ID: "
                                                                + deliveryPersonId)))
                                .flatMap(deliveryPerson -> {
                                        // 1. Always persist location to SQL DB
                                        deliveryPerson.setLatitudeGps(latitude.floatValue());
                                        deliveryPerson.setLongitudeGps(longitude.floatValue());

                                        return deliveryPersonRepository.save(deliveryPerson)
                                                        .doOnSuccess(saved -> log.debug(
                                                                        "Saved GPS location to SQL for delivery person {}: ({}, {})",
                                                                        deliveryPersonId, latitude, longitude))
                                                        .flatMap(savedDeliveryPerson -> {
                                                                // 2. Optionally sync to Elasticsearch
                                                                if (deliveryPersonSearchRepository == null) {
                                                                        log.info("Elasticsearch is disabled. Location saved to SQL only for {}",
                                                                                        deliveryPersonId);
                                                                        return Mono.just(savedDeliveryPerson);
                                                                }

                                                                return Mono.zip(
                                                                                lecturePersonService.findById(
                                                                                                savedDeliveryPerson
                                                                                                                .getPersonId()),
                                                                                lectureLogisticsService
                                                                                                .findByDeliveryPersonId(
                                                                                                                deliveryPersonId)
                                                                                                .defaultIfEmpty(new Logistics()))
                                                                                .flatMap(tuple -> {
                                                                                        var person = tuple.getT1();
                                                                                        var logistics = tuple.getT2();

                                                                                        Double capacityValue = null;
                                                                                        if (logistics.getLength() != null
                                                                                                        && logistics.getWidth() != null
                                                                                                        && logistics.getHeight() != null) {
                                                                                                double volume = logistics
                                                                                                                .getLength()
                                                                                                                * logistics.getWidth()
                                                                                                                * logistics.getHeight();
                                                                                                if ("cm".equalsIgnoreCase(
                                                                                                                logistics.getUnit())) {
                                                                                                        capacityValue = volume
                                                                                                                        / 1000000.0;
                                                                                                } else {
                                                                                                        capacityValue = volume;
                                                                                                }
                                                                                        }

                                                                                        DeliveryPersonDocument document = DeliveryPersonDocument
                                                                                                        .builder()
                                                                                                        .id(savedDeliveryPerson
                                                                                                                        .getId())
                                                                                                        .personId(savedDeliveryPerson
                                                                                                                        .getPersonId())
                                                                                                        .location(new GeoPoint(
                                                                                                                        latitude,
                                                                                                                        longitude))
                                                                                                        .firstName(person
                                                                                                                        .getFirstName())
                                                                                                        .lastName(person.getLastName())
                                                                                                        .email(person.getEmail())
                                                                                                        .phone(person.getPhone())
                                                                                                        .commercialName(savedDeliveryPerson
                                                                                                                        .getCommercialName())
                                                                                                        .status(savedDeliveryPerson
                                                                                                                        .getStatus() != null
                                                                                                                                        ? savedDeliveryPerson
                                                                                                                                                        .getStatus()
                                                                                                                                                        .toString()
                                                                                                                                        : null)
                                                                                                        .isActive(savedDeliveryPerson
                                                                                                                        .getIsActive())
                                                                                                        .isAvailable(true)
                                                                                                        .capacity(capacityValue)
                                                                                                        .unit("m^3")
                                                                                                        .build();

                                                                                        return deliveryPersonSearchRepository
                                                                                                        .save(document)
                                                                                                        .doOnSuccess(doc -> log
                                                                                                                        .debug(
                                                                                                                                        "Synced location and capacity to Elasticsearch for delivery person {}",
                                                                                                                                        deliveryPersonId))
                                                                                                        .doOnError(e -> log
                                                                                                                        .warn(
                                                                                                                                        "Failed to sync to Elasticsearch for {}. SQL update was successful.",
                                                                                                                                        deliveryPersonId,
                                                                                                                                        e))
                                                                                                        .onErrorResume(e -> Mono
                                                                                                                        .just(document))
                                                                                                        .thenReturn(savedDeliveryPerson);
                                                                                });
                                                        });
                                })
                                .doOnError(e -> log.error("Failed to update location for delivery person {}",
                                                deliveryPersonId, e))
                                .then();
        }
}
