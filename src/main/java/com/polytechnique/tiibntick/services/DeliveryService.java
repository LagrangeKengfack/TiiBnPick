package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.delivery.DeliveryRequestDTO;
import com.polytechnique.tiibntick.dtos.delivery.DeliveryResponseDTO;
import com.polytechnique.tiibntick.models.Announcement;
import com.polytechnique.tiibntick.models.Client;
import com.polytechnique.tiibntick.models.Delivery;
import com.polytechnique.tiibntick.models.Person;
import com.polytechnique.tiibntick.models.enums.delivery.DeliveryStatus;
import com.polytechnique.tiibntick.repositories.AnnouncementRepository;
import com.polytechnique.tiibntick.repositories.ClientRepository;
import com.polytechnique.tiibntick.repositories.DeliveryRepository;
import com.polytechnique.tiibntick.repositories.PersonRepository;
import com.polytechnique.tiibntick.services.support.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Service class for managing delivery business logic.
 *
 * @author François-Charles ATANGA
 * @date 21/02/2026
 *       Note: Implemented delivery creation, failure handling, cancellation
 *       logic,
 *       and automated email notifications for all parties.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {

        private final DeliveryRepository deliveryRepository;
        private final AnnouncementRepository announcementRepository;
        private final ClientRepository clientRepository;
        private final PersonRepository personRepository;
        private final EmailService emailService;

        @Transactional("connectionFactoryTransactionManager")
        public Mono<DeliveryResponseDTO> createDelivery(DeliveryRequestDTO request) {
                log.info("Creating delivery for announcement {} and delivery person {}",
                                request.getAnnouncementId(), request.getDeliveryPersonId());

                return announcementRepository.findById(request.getAnnouncementId())
                                .switchIfEmpty(Mono.error(new RuntimeException("Announcement not found")))
                                .flatMap(announcement -> {
                                        Delivery delivery = new Delivery();
                                        delivery.setId(UUID.randomUUID());
                                        delivery.setAnnouncementId(announcement.getId());
                                        delivery.setDeliveryPersonId(request.getDeliveryPersonId());
                                        delivery.setStatus(DeliveryStatus.CREATED);
                                        delivery.setPickupMinTime(request.getPickupMinTime());

                                        // Fields inherited from Announcement
                                        delivery.setTarif(announcement.getAmount() != null
                                                        ? announcement.getAmount().intValue()
                                                        : 0);
                                        delivery.setUrgency(announcement.getUrgency());
                                        delivery.setDistanceKm(announcement.getDistance());
                                        delivery.setDuration(announcement.getDuration());

                                        // Fields forced to null as per user requirement
                                        delivery.setPickupMaxTime(null);
                                        delivery.setDeliveryMinTime(null);
                                        delivery.setDeliveryMaxTime(null);

                                        return deliveryRepository.save(delivery)
                                                        .map(this::mapToResponse);
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

        private Mono<DeliveryResponseDTO> updateDeliveryStatus(UUID deliveryId, DeliveryStatus status,
                        String statusLabel) {
                return deliveryRepository.findById(deliveryId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Delivery not found")))
                                .flatMap(delivery -> {
                                        delivery.setStatus(status);
                                        return deliveryRepository.save(delivery)
                                                        .flatMap(savedDelivery -> notifyParties(savedDelivery,
                                                                        statusLabel)
                                                                        .thenReturn(mapToResponse(savedDelivery)));
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
                                                        + "' est désormais " + statusLabel + ".\n\n"
                                                        +
                                                        "Cordialement,\nL'équipe TiiBnTick";

                                        // Notify Shipper and Recipient (direct emails from Announcement)
                                        Mono<Void> notifyShipper = emailService.sendSimpleMessageReactive(
                                                        announcement.getShipperEmail(),
                                                        subject, body);
                                        Mono<Void> notifyRecipient = emailService
                                                        .sendSimpleMessageReactive(announcement.getRecipientEmail(),
                                                                        subject, body);

                                        // Notify Client (fetch via Person)
                                        Mono<Void> notifyClient = clientRepository.findById(announcement.getClientId())
                                                        .flatMap(client -> personRepository
                                                                        .findById(client.getPersonId()))
                                                        .flatMap(
                                                                        person -> emailService
                                                                                        .sendSimpleMessageReactive(
                                                                                                        person.getEmail(),
                                                                                                        subject, body));

                                        return Mono.when(notifyShipper, notifyRecipient, notifyClient);
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
