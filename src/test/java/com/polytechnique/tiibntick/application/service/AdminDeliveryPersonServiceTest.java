package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.application.service.deliveryperson.LectureDeliveryPersonService;
import com.polytechnique.tiibntick.application.service.deliveryperson.ModificationDeliveryPersonService;
import com.polytechnique.tiibntick.application.service.person.LecturePersonService;
import com.polytechnique.tiibntick.application.service.support.EmailService;
import com.polytechnique.tiibntick.application.service.support.KafkaEventPublisher;
import com.polytechnique.tiibntick.domain.exception.DeliveryPersonNotFoundException;
import com.polytechnique.tiibntick.domain.exception.ForbiddenOperationException;
import com.polytechnique.tiibntick.domain.model.enums.deliveryPerson.DeliveryPersonStatus;
import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonValidatedEvent;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.AdminDeliveryPersonValidationRequest;
import com.polytechnique.tiibntick.infrastructure.web.dto.responses.DeliveryPersonDetailsResponse;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AdminDeliveryPersonServiceTest {

    @Mock
    private LectureDeliveryPersonService lectureDeliveryPersonService;

    @Mock
    private ModificationDeliveryPersonService modificationDeliveryPersonService;

    @Mock
    private LecturePersonService lecturePersonService;

    @Mock
    private EmailService emailService;

    @Mock
    private KafkaEventPublisher kafkaEventPublisher;

    @Mock
    private com.polytechnique.tiibntick.infrastructure.persistence.repository.LogisticsRepository logisticsRepository;

    @Mock
    private com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository deliveryPersonRepository;

    @InjectMocks
    private AdminDeliveryPersonService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
