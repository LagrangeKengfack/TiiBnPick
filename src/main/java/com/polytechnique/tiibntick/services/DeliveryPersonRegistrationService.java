package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.requests.DeliveryPersonRegistrationRequest;
import com.polytechnique.tiibntick.dtos.responses.DeliveryPersonRegistrationResponse;
import com.polytechnique.tiibntick.events.DeliveryPersonCreatedEvent;
import com.polytechnique.tiibntick.exceptions.EmailAlreadyUsedException;
import com.polytechnique.tiibntick.mappers.DeliveryPersonMapper;
import com.polytechnique.tiibntick.models.Address;
import com.polytechnique.tiibntick.models.DeliveryPerson;
import com.polytechnique.tiibntick.models.Logistics;
import com.polytechnique.tiibntick.models.Person;
import com.polytechnique.tiibntick.models.enums.deliveryPerson.DeliveryPersonStatus;
import com.polytechnique.tiibntick.services.address.CreationAddressService;
import com.polytechnique.tiibntick.services.deliveryperson.CreationDeliveryPersonService;
import com.polytechnique.tiibntick.services.logistics.CreationLogisticsService;
import com.polytechnique.tiibntick.services.person.CreationPersonService;
import com.polytechnique.tiibntick.services.person.LecturePersonService;
import com.polytechnique.tiibntick.services.support.EmailService;
import com.polytechnique.tiibntick.services.support.FileStorageService;
import com.polytechnique.tiibntick.services.support.KafkaEventPublisher;
import com.polytechnique.tiibntick.services.support.PasswordHasherService;
import com.polytechnique.tiibntick.validators.DeliveryPersonRegistrationValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple6;

/**
 * Orchestrator service for DeliveryPerson registration.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryPersonRegistrationService {

        private final CreationPersonService creationPersonService;
        private final LecturePersonService lecturePersonService;
        private final CreationDeliveryPersonService creationDeliveryPersonService;
        private final CreationLogisticsService creationLogisticsService;
        private final CreationAddressService creationAddressService;
        private final FileStorageService fileStorageService;

        private final DeliveryPersonRegistrationValidator validator;
        private final DeliveryPersonMapper mapper;
        private final PasswordHasherService passwordHasherService;
        private final EmailService emailService;
        private final KafkaEventPublisher kafkaEventPublisher;

        /**
         * Orchestrates the registration of a new Delivery Person.
         *
         * Coordinates the creation of Person, DeliveryPerson, Logistics, and Address
         * entities.
         * Ensures transactional consistency (reactive) and triggers side effects like
         * email confirmation.
         *
         * @param request the registration request DTO containing all necessary data
         * @return a Mono containing the response DTO with the generated ID and status
         * @throws EmailAlreadyUsedException if the email is already registered
         */
        @Transactional("connectionFactoryTransactionManager")
        public Mono<DeliveryPersonRegistrationResponse> register(DeliveryPersonRegistrationRequest request) {
                return validator.validate(request)
                                .flatMap(validRequest -> lecturePersonService.existsByEmail(validRequest.getEmail())
                                                .flatMap(exists -> {
                                                        if (exists) {
                                                                return Mono.error(new EmailAlreadyUsedException(
                                                                                "Email already in use"));
                                                        }
                                                        return Mono.just(validRequest);
                                                }))
                                .flatMap(validRequest -> {
                                        // Save all photos reactively and update the request object with final paths
                                        return Mono.zip(
                                                        fileStorageService
                                                                        .saveBase64Image(validRequest.getPhotoCard(),
                                                                                        "identite")
                                                                        .defaultIfEmpty("NOT_PROVIDED"),
                                                        fileStorageService
                                                                        .saveBase64Image(validRequest.getCniRecto(),
                                                                                        "cni_recto")
                                                                        .defaultIfEmpty("NOT_PROVIDED"),
                                                        fileStorageService
                                                                        .saveBase64Image(validRequest.getCniVerso(),
                                                                                        "cni_verso")
                                                                        .defaultIfEmpty("NOT_PROVIDED"),
                                                        fileStorageService
                                                                        .saveBase64Image(validRequest.getNuiPhoto(),
                                                                                        "niu")
                                                                        .defaultIfEmpty("NOT_PROVIDED"),
                                                        fileStorageService
                                                                        .saveBase64Image(validRequest.getFrontPhoto(),
                                                                                        "vehicule_avant")
                                                                        .defaultIfEmpty("NOT_PROVIDED"),
                                                        fileStorageService
                                                                        .saveBase64Image(validRequest.getBackPhoto(),
                                                                                        "vehicule_arriere")
                                                                        .defaultIfEmpty("NOT_PROVIDED"))
                                                        .map(imagePaths -> {
                                                                validRequest.setPhotoCard(imagePaths.getT1());
                                                                validRequest.setCniRecto(imagePaths.getT2());
                                                                validRequest.setCniVerso(imagePaths.getT3());

                                                                String niuPath = imagePaths.getT4();
                                                                log.info("NIU Photo processing: received request has photo? {}, saved path: {}",
                                                                                validRequest.getNuiPhoto() != null,
                                                                                niuPath);
                                                                validRequest.setNuiPhoto(niuPath);

                                                                validRequest.setFrontPhoto(imagePaths.getT5());
                                                                validRequest.setBackPhoto(imagePaths.getT6());
                                                                return validRequest;
                                                        });
                                })
                                .flatMap(updatedRequest -> {
                                        Person person = mapper.toPerson(updatedRequest);
                                        person.setPassword(passwordHasherService.encode(updatedRequest.getPassword()));

                                        return creationPersonService.createPerson(person)
                                                        .flatMap(savedPerson -> {
                                                                DeliveryPerson deliveryPerson = mapper
                                                                                .toDeliveryPerson(updatedRequest);
                                                                deliveryPerson.setPersonId(savedPerson.getId());
                                                                deliveryPerson.setStatus(DeliveryPersonStatus.APPROVED);
                                                                deliveryPerson.setIsActive(true);

                                                                return creationDeliveryPersonService
                                                                                .createDeliveryPerson(deliveryPerson)
                                                                                .flatMap(savedDp -> {
                                                                                        Logistics logistics = mapper
                                                                                                        .toLogistics(updatedRequest);
                                                                                        logistics.setDeliveryPersonId(
                                                                                                        savedDp.getId());

                                                                                        Address address = mapper
                                                                                                        .toAddress(updatedRequest);
                                                                                        // Address linked to person or
                                                                                        // stored separately
                                                                                        // For now, we'll just save it

                                                                                        return Mono.zip(
                                                                                                        creationLogisticsService
                                                                                                                        .createLogistics(
                                                                                                                                        logistics),
                                                                                                        creationAddressService
                                                                                                                        .createAddress(address))
                                                                                                        .map(tuple -> savedDp);
                                                                                });
                                                        })
                                                        .doOnSuccess(savedDp -> {
                                                                // Send email (fire and forget)
                                                                emailService.sendRegistrationReceived(
                                                                                updatedRequest.getEmail());

                                                                // Publish Kafka event
                                                                kafkaEventPublisher.publishDeliveryPersonCreated(
                                                                                new DeliveryPersonCreatedEvent(
                                                                                                savedDp.getId(),
                                                                                                updatedRequest.getEmail()));

                                                                log.info("Delivery person registered: {} with status APPROVED",
                                                                                savedDp.getId());
                                                        })
                                                        .map(savedDp -> {
                                                                DeliveryPersonRegistrationResponse response = new DeliveryPersonRegistrationResponse();
                                                                response.setDeliveryPersonId(savedDp.getId());
                                                                response.setStatus("APPROVED");
                                                                return response;
                                                        });
                                });
        }
}
