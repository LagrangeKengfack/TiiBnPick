package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.delivery.DeliveryRequestDTO;
import com.polytechnique.tiibntick.dtos.delivery.DeliveryResponseDTO;
import com.polytechnique.tiibntick.dtos.responses.LocationResponseDTO;
import com.polytechnique.tiibntick.models.Delivery;
import com.polytechnique.tiibntick.models.enums.announcement.AnnouncementStatus;
import com.polytechnique.tiibntick.models.enums.delivery.DeliveryStatus;
import com.polytechnique.tiibntick.repositories.AnnouncementRepository;
import com.polytechnique.tiibntick.repositories.ClientRepository;
import com.polytechnique.tiibntick.repositories.DeliveryPersonRepository;
import com.polytechnique.tiibntick.repositories.DeliveryRepository;
import com.polytechnique.tiibntick.repositories.PersonRepository;
import com.polytechnique.tiibntick.services.support.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Service class for managing delivery business logic.
 *
 * @author François-Charles ATANGA
 * @date 21/02/2026
 */
@Slf4j
@Service
public class DeliveryService {

        private final DeliveryRepository deliveryRepository;
        private final AnnouncementRepository announcementRepository;
        private final ClientRepository clientRepository;
        private final PersonRepository personRepository;
        private final DeliveryPersonRepository deliveryPersonRepository;
        private final EmailService emailService;
        private final DeliveryPersonLocationService deliveryPersonLocationService;

        public DeliveryService(
                        DeliveryRepository deliveryRepository,
                        AnnouncementRepository announcementRepository,
                        ClientRepository clientRepository,
                        PersonRepository personRepository,
                        DeliveryPersonRepository deliveryPersonRepository,
                        EmailService emailService,
                        @Lazy DeliveryPersonLocationService deliveryPersonLocationService) {
                this.deliveryRepository = deliveryRepository;
                this.announcementRepository = announcementRepository;
                this.clientRepository = clientRepository;
                this.personRepository = personRepository;
                this.deliveryPersonRepository = deliveryPersonRepository;
                this.emailService = emailService;
                this.deliveryPersonLocationService = deliveryPersonLocationService;
        }

        @Transactional("connectionFactoryTransactionManager")
        public Mono<DeliveryResponseDTO> createDelivery(DeliveryRequestDTO request) {
                log.info("Creating delivery for announcement {} and delivery person {}",
                                request.getAnnouncementId(), request.getDeliveryPersonId());

                return announcementRepository.findById(request.getAnnouncementId())
                                .switchIfEmpty(Mono.error(new RuntimeException("Announcement not found")))
                                .flatMap(announcement -> {
                                        // Update announcement status to ASSIGNED
                                        announcement.setStatus(AnnouncementStatus.ASSIGNED);
                                        return announcementRepository.save(announcement)
                                                        .flatMap(savedAnnouncement -> {
                                                                Delivery delivery = new Delivery();
                                                                delivery.setId(UUID.randomUUID());
                                                                delivery.setAnnouncementId(savedAnnouncement.getId());
                                                                delivery.setDeliveryPersonId(
                                                                                request.getDeliveryPersonId());
                                                                delivery.setStatus(DeliveryStatus.CREATED);
                                                                delivery.setPickupMinTime(request.getPickupMinTime());

                                                                // Fields inherited from Announcement
                                                                delivery.setTarif(savedAnnouncement.getAmount() != null
                                                                                ? savedAnnouncement.getAmount()
                                                                                                .intValue()
                                                                                : 0);
                                                                delivery.setUrgency(savedAnnouncement.getUrgency());
                                                                delivery.setDistanceKm(savedAnnouncement.getDistance());
                                                                delivery.setDuration(savedAnnouncement.getDuration());

                                                                // Fields forced to null as per user requirement
                                                                delivery.setPickupMaxTime(null);
                                                                delivery.setDeliveryMinTime(null);
                                                                delivery.setDeliveryMaxTime(null);

                                                                return deliveryRepository.save(delivery)
                                                                                .map(this::mapToResponse);
                                                        });
                                });
        }

        @Transactional("connectionFactoryTransactionManager")
        public Mono<DeliveryResponseDTO> failDelivery(UUID deliveryId) {
                log.info("Marking delivery {} as FAILED", deliveryId);
                return updateDeliveryStatus(deliveryId, DeliveryStatus.FAILED, "échouée");
        }

        @Transactional("connectionFactoryTransactionManager")
        public Mono<DeliveryResponseDTO> cancelDelivery(UUID deliveryId) {
                log.info("Marking delivery {} as CANCELLED", deliveryId);
                return updateDeliveryStatus(deliveryId, DeliveryStatus.CANCELLED, "annulée");
        }

        @Transactional("connectionFactoryTransactionManager")
        public Mono<DeliveryResponseDTO> pickupDelivery(UUID deliveryId) {
                log.info("Marking delivery {} as PICKED_UP", deliveryId);
                return deliveryRepository.findById(deliveryId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Delivery not found")))
                                .flatMap(delivery -> {
                                        delivery.setStatus(DeliveryStatus.PICKED_UP);
                                        return deliveryRepository.save(delivery)
                                                        .flatMap(savedDelivery -> notifyPickup(savedDelivery)
                                                                        .thenReturn(mapToResponse(savedDelivery)));
                                });
        }

        @Transactional("connectionFactoryTransactionManager")
        public Mono<DeliveryResponseDTO> startTransit(UUID deliveryId) {
                log.info("Marking delivery {} as IN_TRANSIT", deliveryId);
                return updateDeliveryStatus(deliveryId, DeliveryStatus.IN_TRANSIT, "en cours de livraison");
        }

        public Mono<LocationResponseDTO> getDeliveryLocation(UUID deliveryId) {
                log.info("Fetching location for delivery {}", deliveryId);
                return deliveryRepository.findById(deliveryId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Delivery not found")))
                                .flatMap(delivery -> deliveryPersonRepository.findById(delivery.getDeliveryPersonId()))
                                .switchIfEmpty(Mono.error(new RuntimeException("Delivery Person not found")))
                                .map(dp -> {
                                        LocationResponseDTO response = new LocationResponseDTO();
                                        response.setLatitude(
                                                        dp.getLatitudeGps() != null ? dp.getLatitudeGps().doubleValue()
                                                                        : null);
                                        response.setLongitude(dp.getLongitudeGps() != null
                                                        ? dp.getLongitudeGps().doubleValue()
                                                        : null);
                                        return response;
                                });
        }

        public Mono<DeliveryResponseDTO> updateDeliveryStatus(UUID deliveryId, DeliveryStatus status,
                        String statusLabel) {
                return deliveryRepository.findById(deliveryId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Delivery not found")))
                                .flatMap(delivery -> {
                                        delivery.setStatus(status);
                                        return deliveryRepository.save(delivery)
                                                        .flatMap(savedDelivery -> {
                                                                Mono<Void> syncMono = Mono.empty();
                                                                if (status == DeliveryStatus.IN_TRANSIT
                                                                                || status == DeliveryStatus.DELIVERED) {
                                                                        syncMono = deliveryPersonLocationService
                                                                                        .syncToElasticsearch(
                                                                                                        savedDelivery
                                                                                                                        .getDeliveryPersonId());
                                                                }
                                                                return syncMono.then(notifyParties(savedDelivery,
                                                                                statusLabel))
                                                                                .thenReturn(mapToResponse(
                                                                                                savedDelivery));
                                                        });
                                });
        }

        private Mono<Void> notifyParties(Delivery delivery, String statusLabel) {
                return announcementRepository.findById(delivery.getAnnouncementId())
                                .flatMap(announcement -> {
                                        String subject = "TiiBnTick - Livraison #" + delivery.getId() + " "
                                                        + statusLabel;
                                        String body = "Bonjour,\n\nNous vous informons que la livraison #"
                                                        + delivery.getId() +
                                                        " liée à l'annonce '" + announcement.getTitle()
                                                        + "' est désormais " + statusLabel +
                                                        ".\n\n" +
                                                        "Cordialement,\nL'équipe TiiBnTick";

                                        // Notify Shipper and Recipient (direct emails from Announcement)
                                        Mono<Void> notifyShipper = emailService.sendSimpleMessageReactive(
                                                        announcement.getShipperEmail(), subject, body);
                                        Mono<Void> notifyRecipient = emailService.sendSimpleMessageReactive(
                                                        announcement.getRecipientEmail(), subject, body);

                                        // Notify Client (fetch via Person)
                                        Mono<Void> notifyClient = clientRepository.findById(announcement.getClientId())
                                                        .flatMap(client -> personRepository
                                                                        .findById(client.getPersonId()))
                                                        .flatMap(person -> emailService.sendSimpleMessageReactive(
                                                                        person.getEmail(), subject, body));

                                        return Mono.when(notifyShipper, notifyRecipient, notifyClient);
                                });
        }

        private Mono<Void> notifyPickup(Delivery delivery) {
                return announcementRepository.findById(delivery.getAnnouncementId())
                                .flatMap(announcement -> {
                                        String subject = "TiiBnTick - Votre colis a été récupéré";
                                        String body = "Bonjour,\n\nNous vous informons que le livreur a récupéré votre colis pour la livraison #"
                                                        +
                                                        delivery.getId() + " (Annonce: '" + announcement.getTitle()
                                                        + "').\n\n" +
                                                        "Le colis est désormais en route.\n\n" +
                                                        "Cordialement,\nL'équipe TiiBnTick";

                                        // Notify Recipient (destinataire)
                                        Mono<Void> notifyRecipient = emailService.sendSimpleMessageReactive(
                                                        announcement.getRecipientEmail(), subject, body);

                                        // Notify Client (donneur d'ordre)
                                        Mono<Void> notifyClient = clientRepository.findById(announcement.getClientId())
                                                        .flatMap(client -> personRepository
                                                                        .findById(client.getPersonId()))
                                                        .flatMap(person -> emailService.sendSimpleMessageReactive(
                                                                        person.getEmail(), subject, body));

                                        return Mono.when(notifyRecipient, notifyClient);
                                });
        }

        private DeliveryResponseDTO mapToResponse(Delivery delivery) {
                DeliveryResponseDTO response = new DeliveryResponseDTO();
                response.setId(delivery.getId());
                response.setAnnouncementId(delivery.getAnnouncementId());
                response.setDeliveryPersonId(delivery.getDeliveryPersonId());
                response.setStatus(delivery.getStatus());
                response.setTarif(delivery.getTarif());
                response.setNoteLivreur(delivery.getNoteLivreur());
                response.setPickupMinTime(delivery.getPickupMinTime());
                response.setPickupMaxTime(delivery.getPickupMaxTime());
                response.setUrgency(delivery.getUrgency());
                response.setDeliveryMinTime(delivery.getDeliveryMinTime());
                response.setDeliveryMaxTime(delivery.getDeliveryMaxTime());
                response.setEstimatedDelivery(delivery.getEstimatedDelivery());
                response.setDuration(delivery.getDuration());
                response.setDeliveryNote(delivery.getDeliveryNote());
                response.setDistanceKm(delivery.getDistanceKm());
                return response;
        }
}
