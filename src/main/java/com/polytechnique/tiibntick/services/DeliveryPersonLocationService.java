package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.elasticsearch.models.DeliveryPersonDocument;
import com.polytechnique.tiibntick.elasticsearch.repositories.DeliveryPersonSearchRepository;
import com.polytechnique.tiibntick.models.Logistics;
import com.polytechnique.tiibntick.models.enums.delivery.DeliveryStatus;
import com.polytechnique.tiibntick.repositories.AddressRepository;
import com.polytechnique.tiibntick.repositories.AnnouncementRepository;
import com.polytechnique.tiibntick.repositories.DeliveryPersonRepository;
import com.polytechnique.tiibntick.repositories.DeliveryRepository;
import com.polytechnique.tiibntick.repositories.PacketRepository;
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
        private final DeliveryRepository deliveryRepository;
        private final AnnouncementRepository announcementRepository;
        private final AddressRepository addressRepository;
        private final DeliveryService deliveryService;
        private final LectureDeliveryPersonService lectureDeliveryPersonService;
        private final LecturePersonService lecturePersonService;
        private final LectureLogisticsService lectureLogisticsService;
        private final PacketRepository packetRepository;

        private static final double EARTH_RADIUS_METERS = 6371000.0;

        public DeliveryPersonLocationService(
                        Optional<DeliveryPersonSearchRepository> deliveryPersonSearchRepository,
                        DeliveryPersonRepository deliveryPersonRepository,
                        DeliveryRepository deliveryRepository,
                        AnnouncementRepository announcementRepository,
                        AddressRepository addressRepository,
                        DeliveryService deliveryService,
                        LectureDeliveryPersonService lectureDeliveryPersonService,
                        LecturePersonService lecturePersonService,
                        LectureLogisticsService lectureLogisticsService,
                        PacketRepository packetRepository) {
                this.deliveryPersonSearchRepository = deliveryPersonSearchRepository.orElse(null);
                this.deliveryPersonRepository = deliveryPersonRepository;
                this.deliveryRepository = deliveryRepository;
                this.announcementRepository = announcementRepository;
                this.addressRepository = addressRepository;
                this.deliveryService = deliveryService;
                this.lectureDeliveryPersonService = lectureDeliveryPersonService;
                this.lecturePersonService = lecturePersonService;
                this.lectureLogisticsService = lectureLogisticsService;
                this.packetRepository = packetRepository;
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
                                .switchIfEmpty(Mono.error(new RuntimeException(
                                                "Delivery Person not found with ID: " + deliveryPersonId)))
                                .flatMap(deliveryPerson -> {
                                        // 1. Always persist location to SQL DB
                                        deliveryPerson.setLatitudeGps(latitude.floatValue());
                                        deliveryPerson.setLongitudeGps(longitude.floatValue());

                                        return deliveryPersonRepository.save(deliveryPerson)
                                                        .doOnSuccess(saved -> log.debug(
                                                                        "Saved GPS location to SQL for delivery person {}: ({}, {})",
                                                                        deliveryPersonId, latitude, longitude))
                                                        .flatMap(savedDeliveryPerson -> syncToElasticsearch(
                                                                        deliveryPersonId, latitude, longitude))
                                                        .then(Mono.defer(() -> {
                                                                // Logic for IN_TRANSIT: check distance from pickup
                                                                // point
                                                                return deliveryRepository
                                                                                .findAllByDeliveryPersonIdAndStatus(
                                                                                                deliveryPersonId,
                                                                                                DeliveryStatus.PICKED_UP)
                                                                                .flatMap(delivery -> announcementRepository
                                                                                                .findById(delivery
                                                                                                                .getAnnouncementId())
                                                                                                .flatMap(announcement -> addressRepository
                                                                                                                .findById(announcement
                                                                                                                                .getPickupAddressId())
                                                                                                                .flatMap(address -> {
                                                                                                                        if (address.getLatitude() == null
                                                                                                                                        || address.getLongitude() == null) {
                                                                                                                                log.warn("Pickup address {} has null coordinates. Cannot calculate distance.",
                                                                                                                                                address.getId());
                                                                                                                                return Mono.empty();
                                                                                                                        }

                                                                                                                        double distance = calculateDistanceInMeters(
                                                                                                                                        latitude,
                                                                                                                                        longitude,
                                                                                                                                        address.getLatitude(),
                                                                                                                                        address.getLongitude());

                                                                                                                        if (distance > 1.0) {
                                                                                                                                log.info("Delivery person {} moved more than 1 meter ({}m) from pickup for delivery {}. Status -> IN_TRANSIT",
                                                                                                                                                deliveryPersonId,
                                                                                                                                                distance,
                                                                                                                                                delivery.getId());
                                                                                                                                return deliveryService
                                                                                                                                                .startTransit(delivery
                                                                                                                                                                .getId());
                                                                                                                        }
                                                                                                                        return Mono.empty();
                                                                                                                })))
                                                                                .then();
                                                        }));
                                })
                                .doOnError(e -> log.error("Failed to update location for delivery person {}",
                                                deliveryPersonId, e))
                                .then();
        }

        private double calculateDistanceInMeters(double lat1, double lon1, double lat2, double lon2) {
                double dLat = Math.toRadians(lat2 - lat1);
                double dLon = Math.toRadians(lon2 - lon1);

                double lat1Rad = Math.toRadians(lat1);
                double lat2Rad = Math.toRadians(lat2);

                double a = Math.pow(Math.sin(dLat / 2), 2) +
                                Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

                double c = 2 * Math.asin(Math.sqrt(a));

                return EARTH_RADIUS_METERS * c;
        }

        /**
         * Refreshes the delivery person's data in Elasticsearch.
         * Useful when status or capacity needs to be updated.
         *
         * @param deliveryPersonId ID of the delivery person
         * @return Mono<Void>
         */
        public Mono<Void> syncToElasticsearch(UUID deliveryPersonId) {
                return lectureDeliveryPersonService.findById(deliveryPersonId)
                                .flatMap(dp -> syncToElasticsearch(deliveryPersonId,
                                                dp.getLatitudeGps() != null ? dp.getLatitudeGps().doubleValue() : null,
                                                dp.getLongitudeGps() != null ? dp.getLongitudeGps().doubleValue()
                                                                : null));
        }

        private Mono<Void> syncToElasticsearch(UUID deliveryPersonId, Double latitude, Double longitude) {
                if (deliveryPersonSearchRepository == null) {
                        log.debug("Elasticsearch is disabled. Skipping sync for {}", deliveryPersonId);
                        return Mono.empty();
                }

                return lectureDeliveryPersonService.findById(deliveryPersonId)
                                .flatMap(dp -> Mono.zip(
                                                lecturePersonService.findById(dp.getPersonId()),
                                                lectureLogisticsService.findByDeliveryPersonId(deliveryPersonId)
                                                                .defaultIfEmpty(new Logistics()))
                                                .flatMap(tuple -> {
                                                        var person = tuple.getT1();
                                                        var logistics = tuple.getT2();

                                                        Double totalCapacity = calculateTotalCapacity(logistics);

                                                        return calculateOccupiedVolume(deliveryPersonId)
                                                                        .map(occupied -> {
                                                                                Double availableCapacity = totalCapacity != null
                                                                                                ? Math.max(0.0, totalCapacity
                                                                                                                - occupied)
                                                                                                : null;

                                                                                return DeliveryPersonDocument.builder()
                                                                                                .id(dp.getId())
                                                                                                .personId(dp.getPersonId())
                                                                                                .location(latitude != null
                                                                                                                && longitude != null
                                                                                                                                ? new GeoPoint(latitude,
                                                                                                                                                longitude)
                                                                                                                                : null)
                                                                                                .firstName(person
                                                                                                                .getFirstName())
                                                                                                .lastName(person.getLastName())
                                                                                                .email(person.getEmail())
                                                                                                .phone(person.getPhone())
                                                                                                .commercialName(dp
                                                                                                                .getCommercialName())
                                                                                                .status(dp.getStatus() != null
                                                                                                                ? dp.getStatus().toString()
                                                                                                                : null)
                                                                                                .isActive(dp.getIsActive())
                                                                                                .isAvailable(true)
                                                                                                .capacity(availableCapacity)
                                                                                                .unit("m^3")
                                                                                                .build();
                                                                        })
                                                                        .flatMap(deliveryPersonSearchRepository::save)
                                                                        .doOnSuccess(doc -> log.debug(
                                                                                        "Synced location and capacity ({}) to Elasticsearch for delivery person {}",
                                                                                        doc.getCapacity(),
                                                                                        deliveryPersonId))
                                                                        .doOnError(e -> log.warn(
                                                                                        "Failed to sync to Elasticsearch for {}.",
                                                                                        deliveryPersonId, e))
                                                                        .then();
                                                }));
        }

        private Double calculateTotalCapacity(Logistics logistics) {
                if (logistics.getLength() != null && logistics.getWidth() != null && logistics.getHeight() != null) {
                        double volume = logistics.getLength() * logistics.getWidth() * logistics.getHeight();
                        if ("cm".equalsIgnoreCase(logistics.getUnit())) {
                                return volume / 1000000.0;
                        } else {
                                return volume;
                        }
                }
                return null;
        }

        private Mono<Double> calculateOccupiedVolume(UUID deliveryPersonId) {
                return deliveryRepository
                                .findAllByDeliveryPersonIdAndStatus(deliveryPersonId, DeliveryStatus.IN_TRANSIT)
                                .flatMap(delivery -> announcementRepository.findById(delivery.getAnnouncementId()))
                                .flatMap(announcement -> packetRepository.findById(announcement.getPacketId()))
                                .map(packet -> {
                                        if (packet.getLength() != null && packet.getWidth() != null) {
                                                double h = packet.getHeight() != null ? packet.getHeight()
                                                                : (packet.getThickness() != null ? packet.getThickness()
                                                                                : 0.0);
                                                double volCm3 = packet.getLength() * packet.getWidth() * h;
                                                return volCm3 / 1000000.0; // Assume packet dimensions are in cm
                                        }
                                        return 0.0;
                                })
                                .reduce(0.0, Double::sum);
        }
}
