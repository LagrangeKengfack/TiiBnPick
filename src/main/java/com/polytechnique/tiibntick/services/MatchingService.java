package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.announcement.AnnouncementResponseDTO;
import com.polytechnique.tiibntick.elasticsearch.models.AnnouncementDocument;
import com.polytechnique.tiibntick.elasticsearch.models.DeliveryPersonDocument;
import com.polytechnique.tiibntick.elasticsearch.repositories.AnnouncementSearchRepository;
import com.polytechnique.tiibntick.elasticsearch.repositories.DeliveryPersonSearchRepository;
import com.polytechnique.tiibntick.events.AnnouncementPublishedEvent;
import com.polytechnique.tiibntick.models.DeliveryPerson;
import com.polytechnique.tiibntick.repositories.DeliveryPersonRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service responsible for matching announcements with eligible delivery
 * persons.
 * Consumes Kafka events and performs spatial filtering.
 * Falls back to SQL-based matching when Elasticsearch is unavailable.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@Service
@Slf4j
public class MatchingService {

    private final AnnouncementSearchRepository announcementSearchRepository;
    private final DeliveryPersonSearchRepository deliveryPersonSearchRepository;
    private final DeliveryPersonRepository deliveryPersonRepository;
    private final NotificationService notificationService;

    public MatchingService(
            Optional<AnnouncementSearchRepository> announcementSearchRepository,
            Optional<DeliveryPersonSearchRepository> deliveryPersonSearchRepository,
            DeliveryPersonRepository deliveryPersonRepository,
            NotificationService notificationService) {
        this.announcementSearchRepository = announcementSearchRepository.orElse(null);
        this.deliveryPersonSearchRepository = deliveryPersonSearchRepository.orElse(null);
        this.deliveryPersonRepository = deliveryPersonRepository;
        this.notificationService = notificationService;
    }

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double INITIAL_DELTA_KM = 1.5;
    private static final double DELTA_INCREMENT_KM = 0.5;
    private static final double MAX_DELTA_KM = 10.0;
    private static final long RETRY_WAIT_TIME_MINUTES = 1;

    /**
     * Consumes the AnnouncementPublishedEvent and triggers the matching process.
     *
     * @param event The published announcement event.
     */
    @KafkaListener(topics = "announcement-published", groupId = "tiibntick-group")
    public void consumeAnnouncementPublishedEvent(AnnouncementPublishedEvent event) {
        log.info("Received AnnouncementPublishedEvent: {}", event);

        AnnouncementResponseDTO announcementDTO = event.getAnnouncement();

        // Validate addresses
        if (announcementDTO.getPickupAddress() == null
                || announcementDTO.getPickupAddress().getLatitude() == null
                || announcementDTO.getPickupAddress().getLongitude() == null) {
            log.error("Pickup address or coordinates missing for announcement {}", announcementDTO.getId());
            return;
        }

        if (announcementDTO.getDeliveryAddress() == null
                || announcementDTO.getDeliveryAddress().getLatitude() == null
                || announcementDTO.getDeliveryAddress().getLongitude() == null) {
            log.error("Delivery address or coordinates missing for announcement {}", announcementDTO.getId());
            return;
        }

        try {
            // Try Elasticsearch-based matching first
            if (announcementSearchRepository != null && deliveryPersonSearchRepository != null) {
                try {
                    processWithElasticsearch(announcementDTO);
                    return; // Success with ES
                } catch (Exception esException) {
                    log.warn("Elasticsearch unavailable for announcement {}. Falling back to SQL-based matching.",
                            announcementDTO.getId(), esException);
                }
            } else {
                log.info("Elasticsearch repositories not available. Using SQL-based matching.");
            }

            // Fallback: SQL-based matching
            processWithSqlFallback(announcementDTO);

        } catch (Exception e) {
            log.error(
                    "Failed to process announcement {} after all attempts. Message will be acknowledged to prevent infinite retry loop.",
                    announcementDTO.getId(), e);
            // Don't rethrow — this prevents Kafka from endlessly retrying the same message
        }
    }

    /**
     * Elasticsearch-based matching (original flow).
     */
    private void processWithElasticsearch(AnnouncementResponseDTO announcementDTO) {
        AnnouncementDocument announcementDoc = buildAnnouncementDocument(announcementDTO);

        announcementSearchRepository.save(announcementDoc)
                .doOnSuccess(saved -> log.info("Announcement indexed in Elasticsearch: {}", saved.getId()))
                .flatMap(saved -> performMatchingES(saved, INITIAL_DELTA_KM))
                .doOnError(e -> log.error("Error during ES matching for announcement {}", announcementDTO.getId(), e))
                .block();
    }

    /**
     * SQL-based fallback matching.
     * Queries delivery persons with GPS coordinates from the SQL database
     * and performs Haversine filtering in Java.
     */
    private void processWithSqlFallback(AnnouncementResponseDTO announcementDTO) {
        double pickupLat = announcementDTO.getPickupAddress().getLatitude();
        double pickupLon = announcementDTO.getPickupAddress().getLongitude();
        double deliveryLat = announcementDTO.getDeliveryAddress().getLatitude();
        double deliveryLon = announcementDTO.getDeliveryAddress().getLongitude();

        double distF1F2 = calculateHaversineDistance(pickupLat, pickupLon, deliveryLat, deliveryLon);
        double dMax = distF1F2 + (2 * MAX_DELTA_KM); // Use max delta directly for SQL fallback

        log.info("SQL fallback matching for announcement {} with Dmax={} km", announcementDTO.getId(), dMax);

        List<DeliveryPerson> allWithGps = deliveryPersonRepository
                .findAllByIsActiveTrueAndLatitudeGpsIsNotNullAndLongitudeGpsIsNotNull()
                .collectList()
                .block();

        if (allWithGps == null || allWithGps.isEmpty()) {
            log.info("No delivery persons with GPS coordinates found in SQL database for announcement {}",
                    announcementDTO.getId());
            return;
        }

        // Spatial filtering using spherical ellipse
        List<DeliveryPersonDocument> eligibleCandidates = new ArrayList<>();
        for (DeliveryPerson dp : allWithGps) {
            double dpLat = dp.getLatitudeGps();
            double dpLon = dp.getLongitudeGps();

            double distP_F1 = calculateHaversineDistance(dpLat, dpLon, pickupLat, pickupLon);
            double distP_F2 = calculateHaversineDistance(dpLat, dpLon, deliveryLat, deliveryLon);

            if (distP_F1 + distP_F2 <= dMax) {
                // Convert SQL model to Document for notification compatibility
                DeliveryPersonDocument doc = DeliveryPersonDocument.builder()
                        .id(dp.getId())
                        .location(new GeoPoint(dpLat, dpLon))
                        .isActive(dp.getIsActive())
                        .isAvailable(true)
                        .commercialName(dp.getCommercialName())
                        .build();
                eligibleCandidates.add(doc);
            }
        }

        if (eligibleCandidates.isEmpty()) {
            log.info("No eligible candidates found via SQL fallback for announcement {}", announcementDTO.getId());
            return;
        }

        log.info("SQL fallback found {} eligible candidates: {}", eligibleCandidates.size(),
                eligibleCandidates.stream().map(DeliveryPersonDocument::getId).toList());

        // Build a minimal AnnouncementDocument for notification
        AnnouncementDocument announcementDoc = buildAnnouncementDocument(announcementDTO);

        notificationService.notifyEligibleDeliveryPersons(eligibleCandidates, announcementDoc)
                .then()
                .block();
    }

    /**
     * Builds an AnnouncementDocument from the DTO.
     */
    private AnnouncementDocument buildAnnouncementDocument(AnnouncementResponseDTO dto) {
        AnnouncementDocument doc = AnnouncementDocument.builder()
                .id(dto.getId())
                .clientId(dto.getClientId())
                .packet(dto.getPacket())
                .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : Instant.now())
                .amount(dto.getAmount())
                .build();

        doc.setPickupLocation(new GeoPoint(
                dto.getPickupAddress().getLatitude(),
                dto.getPickupAddress().getLongitude()));

        doc.setDeliveryLocation(new GeoPoint(
                dto.getDeliveryAddress().getLatitude(),
                dto.getDeliveryAddress().getLongitude()));

        return doc;
    }

    /**
     * Elasticsearch-based matching with expanding delta.
     */
    private Mono<Void> performMatchingES(AnnouncementDocument announcement, double delta) {
        GeoPoint F1 = announcement.getPickupLocation();
        GeoPoint F2 = announcement.getDeliveryLocation();

        double distF1F2 = calculateHaversineDistance(F1.getLat(), F1.getLon(), F2.getLat(), F2.getLon());
        double dMax = distF1F2 + (2 * delta);

        log.info("Starting ES matching for Announcement {} with delta={} km, Dmax={} km", announcement.getId(), delta,
                dMax);

        if (deliveryPersonSearchRepository == null) {
            log.warn("Elasticsearch is disabled. Cannot find candidates for matching.");
            return Mono.empty();
        }

        return deliveryPersonSearchRepository
                .findByIsAvailableTrueAndIsActiveTrueAndLocationNear(F1, new Distance(dMax, Metrics.KILOMETERS))
                .collectList()
                .flatMap(candidates -> {
                    List<DeliveryPersonDocument> eligibleCandidates = new ArrayList<>();
                    for (DeliveryPersonDocument candidate : candidates) {
                        double distP_F1 = calculateHaversineDistance(candidate.getLocation().getLat(),
                                candidate.getLocation().getLon(), F1.getLat(), F1.getLon());
                        double distP_F2 = calculateHaversineDistance(candidate.getLocation().getLat(),
                                candidate.getLocation().getLon(), F2.getLat(), F2.getLon());

                        if (distP_F1 + distP_F2 <= dMax) {
                            eligibleCandidates.add(candidate);
                        }
                    }

                    if (eligibleCandidates.isEmpty()) {
                        log.info("No eligible candidates found for delta={}. Current search expansion...", delta);
                        if (delta < MAX_DELTA_KM) {
                            return performMatchingES(announcement, delta + DELTA_INCREMENT_KM);
                        } else {
                            log.info(
                                    "No candidates found up to max delta of {} km. Waiting {} minute(s) before retry for announcement {}",
                                    MAX_DELTA_KM, RETRY_WAIT_TIME_MINUTES, announcement.getId());
                            return Mono.delay(Duration.ofMinutes(RETRY_WAIT_TIME_MINUTES))
                                    .then(performMatchingES(announcement, INITIAL_DELTA_KM));
                        }
                    } else {
                        log.info("Found {} eligible candidates: {}", eligibleCandidates.size(),
                                eligibleCandidates.stream().map(DeliveryPersonDocument::getId).toList());

                        return notificationService.notifyEligibleDeliveryPersons(eligibleCandidates, announcement)
                                .then();
                    }
                });
    }

    /**
     * Calculates the Haversine distance between two points in Kilometers.
     */
    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);

        double a = Math.pow(Math.sin(dLat / 2), 2) +
                Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

        double c = 2 * Math.asin(Math.sqrt(a));

        return EARTH_RADIUS_KM * c;
    }
}
