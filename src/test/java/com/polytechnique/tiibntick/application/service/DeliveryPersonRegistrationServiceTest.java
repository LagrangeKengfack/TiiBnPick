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
import com.polytechnique.tiibntick.domain.exception.EmailAlreadyUsedException;
import com.polytechnique.tiibntick.domain.model.Address;
import com.polytechnique.tiibntick.domain.model.DeliveryPerson;
import com.polytechnique.tiibntick.domain.model.Logistics;
import com.polytechnique.tiibntick.domain.model.Person;
import com.polytechnique.tiibntick.domain.model.enums.deliveryPerson.DeliveryPersonStatus;
import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonCreatedEvent;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonRegistrationRequest;
import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonRegistrationResponse;
import com.polytechnique.tiibntick.infrastructure.web.mapper.DeliveryPersonMapper;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

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
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
