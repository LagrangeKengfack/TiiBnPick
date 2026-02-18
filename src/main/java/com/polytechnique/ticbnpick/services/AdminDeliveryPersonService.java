package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.dtos.requests.AdminDeliveryPersonValidationRequest;
import com.polytechnique.ticbnpick.dtos.responses.DeliveryPersonDetailsResponse;
import com.polytechnique.ticbnpick.events.DeliveryPersonValidatedEvent;
import com.polytechnique.ticbnpick.exceptions.DeliveryPersonNotFoundException;
import com.polytechnique.ticbnpick.exceptions.ForbiddenOperationException;
import com.polytechnique.ticbnpick.models.enums.deliveryPerson.DeliveryPersonStatus;
import com.polytechnique.ticbnpick.services.deliveryperson.LectureDeliveryPersonService;
import com.polytechnique.ticbnpick.services.deliveryperson.ModificationDeliveryPersonService;
import com.polytechnique.ticbnpick.services.person.LecturePersonService;
import com.polytechnique.ticbnpick.services.support.EmailService;
import com.polytechnique.ticbnpick.services.support.KafkaEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Orchestrator service for Admin operations on DeliveryPersons.
 * 
 * <p>
 * Handles administrative actions including:
 * <ul>
 * <li>Validation of new delivery person registrations (APPROVED/REJECTED)</li>
 * <li>Suspension of active delivery person accounts</li>
 * <li>Revocation (permanent deactivation) of delivery person accounts</li>
 * </ul>
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDeliveryPersonService {

    private final LectureDeliveryPersonService lectureDeliveryPersonService;
    private final ModificationDeliveryPersonService modificationDeliveryPersonService;
    private final LecturePersonService lecturePersonService;
    private final EmailService emailService;
    private final KafkaEventPublisher kafkaEventPublisher;
    private final com.polytechnique.ticbnpick.repositories.LogisticsRepository logisticsRepository;
    private final com.polytechnique.ticbnpick.repositories.DeliveryPersonRepository deliveryPersonRepository;

    /**
     * Validates or rejects a delivery person registration application.
     *
     * <p>
     * Updates the status of the delivery person based on admin decision.
     * If approved, sends an approval email and publishes a Kafka event.
     * If rejected, sends a rejection notice with optional reason.
     *
     * @param request the validation request containing the delivery person ID and
     *                decision
     * @return a Mono&lt;Void&gt; signaling completion
     * @throws DeliveryPersonNotFoundException if the delivery person ID is invalid
     * @throws ForbiddenOperationException     if the delivery person status is not
     *                                         PENDING
     */
    public Mono<Void> validateRegistration(AdminDeliveryPersonValidationRequest request) {
        return lectureDeliveryPersonService.findById(request.getDeliveryPersonId())
                .switchIfEmpty(Mono.error(new DeliveryPersonNotFoundException("Delivery Person not found")))
                .flatMap(dp -> {
                    if (dp.getStatus() != DeliveryPersonStatus.PENDING) {
                        return Mono.error(new ForbiddenOperationException("Can only validate PENDING requests"));
                    }

                    if (request.isApproved()) {
                        dp.setStatus(DeliveryPersonStatus.APPROVED);
                        return modificationDeliveryPersonService.updateDeliveryPerson(dp)
                                .flatMap(updated -> lecturePersonService.findById(updated.getPersonId())
                                        .doOnNext(person -> {
                                            emailService.sendAccountApproved(person.getEmail());
                                            kafkaEventPublisher.publishDeliveryPersonValidated(
                                                    new DeliveryPersonValidatedEvent(updated.getId(), true));
                                            log.info("Delivery person {} approved", updated.getId());
                                        })
                                        .then());
                    } else {
                        dp.setStatus(DeliveryPersonStatus.REJECTED);
                        // dp.setIsActive(false); // Optional: ensure they are offline if rejected
                        return modificationDeliveryPersonService.updateDeliveryPerson(dp)
                                .flatMap(updated -> lecturePersonService.findById(updated.getPersonId())
                                        .doOnNext(person -> {
                                            emailService.sendAccountRejected(person.getEmail(), request.getReason());
                                            kafkaEventPublisher.publishDeliveryPersonValidated(
                                                    new DeliveryPersonValidatedEvent(updated.getId(), false));
                                            log.info("Delivery person {} rejected", updated.getId());
                                        })
                                        .then());
                    }
                })
                .then();
    }

    /**
     * Suspends an active delivery person account.
     *
     * <p>
     * Changes the delivery person status to SUSPENDED and sends a notification
     * email.
     * Only APPROVED accounts can be suspended.
     *
     * @param deliveryPersonId the UUID of the delivery person to suspend
     * @return a Mono&lt;Void&gt; signaling completion
     * @throws DeliveryPersonNotFoundException if the delivery person ID is invalid
     * @throws ForbiddenOperationException     if the account is not in APPROVED
     *                                         status
     */
    public Mono<Void> suspendDeliveryPerson(UUID deliveryPersonId) {
        return lectureDeliveryPersonService.findById(deliveryPersonId)
                .switchIfEmpty(Mono.error(new DeliveryPersonNotFoundException("Delivery Person not found")))
                .flatMap(dp -> {
                    if (dp.getStatus() != DeliveryPersonStatus.APPROVED) {
                        return Mono.error(new ForbiddenOperationException("Can only suspend APPROVED accounts"));
                    }

                    dp.setStatus(DeliveryPersonStatus.SUSPENDED);
                    dp.setIsActive(false); // Force offline
                    return modificationDeliveryPersonService.updateDeliveryPerson(dp)
                            .flatMap(updated -> lecturePersonService.findById(updated.getPersonId())
                                    .doOnNext(person -> {
                                        emailService.sendAccountSuspended(person.getEmail());
                                        log.info("Delivery person {} suspended", updated.getId());
                                    })
                                    .then());
                })
                .then();
    }

    /**
     * Revokes (permanently deactivates) a delivery person account.
     *
     * <p>
     * Changes the delivery person status to REJECTED (permanent revocation) and
     * sends
     * a notification email. APPROVED or SUSPENDED accounts can be revoked.
     *
     * @param deliveryPersonId the UUID of the delivery person to revoke
     * @return a Mono&lt;Void&gt; signaling completion
     * @throws DeliveryPersonNotFoundException if the delivery person ID is invalid
     * @throws ForbiddenOperationException     if the account is already REJECTED or
     *                                         PENDING
     */
    public Mono<Void> revokeDeliveryPerson(UUID deliveryPersonId) {
        return lectureDeliveryPersonService.findById(deliveryPersonId)
                .switchIfEmpty(Mono.error(new DeliveryPersonNotFoundException("Delivery Person not found")))
                .flatMap(dp -> {
                    if (dp.getStatus() == DeliveryPersonStatus.PENDING
                            || dp.getStatus() == DeliveryPersonStatus.REJECTED) {
                        return Mono.error(
                                new ForbiddenOperationException("Cannot revoke PENDING or already REJECTED accounts"));
                    }

                    dp.setStatus(DeliveryPersonStatus.REJECTED);
                    dp.setIsActive(false); // Force offline
                    return modificationDeliveryPersonService.updateDeliveryPerson(dp)
                            .flatMap(updated -> lecturePersonService.findById(updated.getPersonId())
                                    .doOnNext(person -> {
                                        emailService.sendAccountRevoked(person.getEmail());
                                        log.info("Delivery person {} revoked", updated.getId());
                                    })
                                    .then());
                })
                .then();
    }

    /**
     * Retrieves aggregated details of a delivery person for admin view.
     *
     * <p>
     * Fetches and combines data from Person and DeliveryPerson entities
     * into a single detailed response for administrative purposes.
     *
     * @param id the UUID of the delivery person
     * @return a Mono containing the detailed response DTO
     * @throws DeliveryPersonNotFoundException if the delivery person is not found
     */
    public Mono<DeliveryPersonDetailsResponse> getDeliveryPersonDetails(UUID id) {
        return lectureDeliveryPersonService.findById(id)
                .switchIfEmpty(Mono.error(new DeliveryPersonNotFoundException("Delivery Person not found")))
                .flatMap(dp -> lecturePersonService.findById(dp.getPersonId())
                        .flatMap(person -> logisticsRepository.findByDeliveryPersonId(dp.getId())
                                .map(logistics -> mapToDetailsResponse(dp, person, logistics))
                                .defaultIfEmpty(mapToDetailsResponse(dp, person, null))));
    }

    /**
     * Retrieves all delivery persons, optionally filtered by status.
     *
     * @param status optional status to filter by
     * @return a Flux of delivery person details
     */
    public reactor.core.publisher.Flux<DeliveryPersonDetailsResponse> getAllDeliveryPersons(
            DeliveryPersonStatus status) {
        reactor.core.publisher.Flux<com.polytechnique.ticbnpick.models.DeliveryPerson> deliveryPersons;
        if (status != null) {
            deliveryPersons = deliveryPersonRepository.findAllByStatus(status);
        } else {
            deliveryPersons = deliveryPersonRepository.findAll();
        }

        return deliveryPersons.flatMap(dp -> lecturePersonService.findById(dp.getPersonId())
                .flatMap(person -> logisticsRepository.findByDeliveryPersonId(dp.getId())
                        .map(logistics -> mapToDetailsResponse(dp, person, logistics))
                        .defaultIfEmpty(mapToDetailsResponse(dp, person, null))));
    }

    private DeliveryPersonDetailsResponse mapToDetailsResponse(com.polytechnique.ticbnpick.models.DeliveryPerson dp,
            com.polytechnique.ticbnpick.models.Person person, com.polytechnique.ticbnpick.models.Logistics logistics) {
        DeliveryPersonDetailsResponse response = new DeliveryPersonDetailsResponse();
        response.setId(dp.getId());
        response.setFirstName(person.getFirstName());
        response.setLastName(person.getLastName());
        response.setEmail(person.getEmail());
        response.setPhone(person.getPhone());
        response.setStatus(dp.getStatus().name());
        response.setCommercialName(dp.getCommercialName());
        response.setNuiNumber(dp.getTaxpayerNumber());
        // Use the new nuiPhoto field from Person entity, falling back to null if not
        // set
        response.setNuiPhoto(person.getNuiPhoto());
        log.info("Mapping person NUI Photo: {}", person.getNuiPhoto());

        // Personal Info
        response.setNationalId(person.getNationalId());
        response.setPhotoCard(person.getPhotoCard());
        response.setCniRecto(person.getCniRecto());
        response.setCniVerso(person.getCniVerso());
        response.setIdCardVerified(true); // Placeholder

        // Vehicle Info from Logistics
        if (logistics != null) {
            response.setVehicleType(logistics.getLogisticsType().name());
            response.setVehicleBrand(logistics.getBrand());
            response.setVehicleModel(logistics.getModel());
            response.setVehicleRegNumber(logistics.getPlateNumber());
            response.setVehicleColor(logistics.getColor());
            response.setVehicleFrontPhoto(logistics.getFrontPhoto());
            response.setVehicleBackPhoto(logistics.getBackPhoto());
            response.setVehicleRegVerified(true); // Placeholder
            response.setInsuranceVerified(false); // Placeholder
        }

        // Meta
        response.setCreatedAt(dp.getCreatedAt() != null ? dp.getCreatedAt().toString() : null);
        response.setUpdatedAt(dp.getUpdatedAt() != null ? dp.getUpdatedAt().toString() : null);

        return response;
    }
}
