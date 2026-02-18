package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.requests.DeliveryPersonRegistrationRequest;
import com.polytechnique.tiibntick.dtos.responses.DeliveryPersonRegistrationResponse;
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
import com.polytechnique.tiibntick.services.support.PasswordHasherService;
import com.polytechnique.tiibntick.validators.DeliveryPersonRegistrationValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryPersonRegistrationServiceTest {

    @Mock
    private CreationPersonService creationPersonService;
    @Mock
    private LecturePersonService lecturePersonService;
    @Mock
    private CreationDeliveryPersonService creationDeliveryPersonService;
    @Mock
    private CreationLogisticsService creationLogisticsService;
    @Mock
    private CreationAddressService creationAddressService;
    @Mock
    private DeliveryPersonRegistrationValidator validator;
    @Mock
    private DeliveryPersonMapper mapper;
    @Mock
    private PasswordHasherService passwordHasherService;
    @Mock
    private EmailService emailService;
    @Mock
    private com.polytechnique.tiibntick.services.support.KafkaEventPublisher kafkaEventPublisher;
    @Mock
    private com.polytechnique.tiibntick.services.support.FileStorageService fileStorageService;

    @InjectMocks
    private DeliveryPersonRegistrationService service;

    @Test
    void register_Success_ShouldReturnPendingStatus() {
        // Arrange
        DeliveryPersonRegistrationRequest request = new DeliveryPersonRegistrationRequest();
        request.setEmail("test@test.com");
        request.setPassword("plainPassword");

        Person person = new Person();
        person.setEmail("test@test.com");

        Person savedPerson = new Person();
        savedPerson.setId(UUID.randomUUID());
        savedPerson.setEmail("test@test.com");

        DeliveryPerson deliveryPerson = new DeliveryPerson();
        DeliveryPerson savedDeliveryPerson = new DeliveryPerson();
        savedDeliveryPerson.setId(UUID.randomUUID());
        savedDeliveryPerson.setStatus(DeliveryPersonStatus.PENDING);

        Logistics logistics = new Logistics();
        Address address = new Address();

        when(validator.validate(request)).thenReturn(Mono.just(request));
        when(lecturePersonService.existsByEmail(anyString())).thenReturn(Mono.just(false));
        when(passwordHasherService.encode("plainPassword")).thenReturn("hashedPassword");

        when(fileStorageService.saveBase64Image(any(), anyString())).thenReturn(Mono.just("path/to/image"));

        when(mapper.toPerson(request)).thenReturn(person);
        when(mapper.toDeliveryPerson(request)).thenReturn(deliveryPerson);
        when(mapper.toLogistics(request)).thenReturn(logistics);
        when(mapper.toAddress(request)).thenReturn(address);

        when(creationPersonService.createPerson(any(Person.class))).thenReturn(Mono.just(savedPerson));
        when(creationDeliveryPersonService.createDeliveryPerson(any(DeliveryPerson.class)))
                .thenReturn(Mono.just(savedDeliveryPerson));
        when(creationLogisticsService.createLogistics(any(Logistics.class))).thenReturn(Mono.just(new Logistics()));
        when(creationAddressService.createAddress(any(Address.class))).thenReturn(Mono.just(new Address()));

        // Act & Assert
        StepVerifier.create(service.register(request))
                .expectNextMatches(response -> "PENDING".equals(response.getStatus()) &&
                        response.getDeliveryPersonId() != null)
                .verifyComplete();

        verify(passwordHasherService).encode("plainPassword");
        org.junit.jupiter.api.Assertions.assertEquals("hashedPassword", person.getPassword());
        // verify(emailService).sendSimpleMessage(eq("test@test.com"), anyString(),
        // anyString()); // If email is sent
    }

    @Test
    void register_EmailAlreadyExists_ShouldThrowError() {
        // Arrange
        DeliveryPersonRegistrationRequest request = new DeliveryPersonRegistrationRequest();
        request.setEmail("test@test.com");

        when(validator.validate(request)).thenReturn(Mono.just(request));
        when(lecturePersonService.existsByEmail(anyString())).thenReturn(Mono.just(true));

        // Act & Assert
        StepVerifier.create(service.register(request))
                .expectError(EmailAlreadyUsedException.class)
                .verify();

        verify(creationPersonService, never()).createPerson(any());
    }
}
