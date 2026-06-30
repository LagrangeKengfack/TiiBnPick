package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.application.service.address.CreationAddressService;
import com.polytechnique.tiibntick.application.service.deliveryperson.CreationDeliveryPersonService;
import com.polytechnique.tiibntick.application.service.logistics.CreationLogisticsService;
import com.polytechnique.tiibntick.application.service.person.CreationPersonService;
import com.polytechnique.tiibntick.application.service.person.LecturePersonService;
import com.polytechnique.tiibntick.application.service.support.EmailService;
import com.polytechnique.tiibntick.application.service.support.FileStorageService;
import com.polytechnique.tiibntick.application.service.support.KafkaEventPublisher;
import com.polytechnique.tiibntick.application.service.support.PasswordHasherService;
import com.polytechnique.tiibntick.application.validator.DeliveryPersonRegistrationValidator;
import com.polytechnique.tiibntick.domain.model.Address;
import com.polytechnique.tiibntick.domain.model.DeliveryPerson;
import com.polytechnique.tiibntick.domain.model.Logistics;
import com.polytechnique.tiibntick.domain.model.Person;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonRegistrationRequest;
import com.polytechnique.tiibntick.infrastructure.web.mapper.DeliveryPersonMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import reactor.util.function.Tuples;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

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
    private FileStorageService fileStorageService;

    @Mock
    private DeliveryPersonRegistrationValidator validator;

    @Mock
    private DeliveryPersonMapper mapper;

    @Mock
    private PasswordHasherService passwordHasherService;

    @Mock
    private EmailService emailService;

    @Mock
    private KafkaEventPublisher kafkaEventPublisher;

    @InjectMocks
    private DeliveryPersonRegistrationService service;

    @Test
    void registerPointRelais_shouldProcessStorefrontPhotoAndOpeningHours() {
        // Arrange
        DeliveryPersonRegistrationRequest request = new DeliveryPersonRegistrationRequest();
        request.setEmail("test@pointrelais.com");
        request.setPassword("password");
        request.setLogisticsType("POINT_RELAIS");

        FilePart photo = org.mockito.Mockito.mock(FilePart.class);

        when(validator.validate(request)).thenReturn(Mono.just(request));
        when(lecturePersonService.existsByEmail(request.getEmail())).thenReturn(Mono.just(false));

        when(fileStorageService.saveFilePart(any(), any())).thenReturn(Mono.just("path/to/file"));

        Person mappedPerson = new Person();
        mappedPerson.setId(UUID.randomUUID());
        when(mapper.toPerson(any())).thenReturn(mappedPerson);
        when(passwordHasherService.encode(any())).thenReturn("hashed");
        when(creationPersonService.createPerson(any())).thenReturn(Mono.just(mappedPerson));

        DeliveryPerson mappedDp = new DeliveryPerson();
        mappedDp.setId(UUID.randomUUID());
        when(mapper.toDeliveryPerson(any())).thenReturn(mappedDp);
        when(creationDeliveryPersonService.createDeliveryPerson(any())).thenReturn(Mono.just(mappedDp));

        Logistics mappedLogistics = new Logistics();
        when(mapper.toLogistics(any())).thenReturn(mappedLogistics);
        when(creationLogisticsService.createLogistics(any())).thenReturn(Mono.just(mappedLogistics));

        Address mappedAddress = new Address();
        when(mapper.toAddress(any())).thenReturn(mappedAddress);
        when(creationAddressService.createAddress(any())).thenReturn(Mono.just(mappedAddress));

        // Act & Assert
        StepVerifier.create(service.register(request, photo, photo, photo, photo, photo, photo, photo))
                .expectNextMatches(response -> {
                    assertThat(response.getDeliveryPersonId()).isEqualTo(mappedDp.getId());
                    assertThat(response.getStatus()).isEqualTo("PENDING");
                    return true;
                })
                .verifyComplete();
    }
}
