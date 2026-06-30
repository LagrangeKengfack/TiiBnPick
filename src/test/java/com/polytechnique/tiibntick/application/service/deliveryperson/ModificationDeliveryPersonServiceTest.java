package com.polytechnique.tiibntick.application.service.deliveryperson;

import com.polytechnique.tiibntick.domain.model.DeliveryPerson;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class ModificationDeliveryPersonServiceTest {

    @Mock
    private DeliveryPersonRepository deliveryPersonRepository;

    @InjectMocks
    private ModificationDeliveryPersonService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
