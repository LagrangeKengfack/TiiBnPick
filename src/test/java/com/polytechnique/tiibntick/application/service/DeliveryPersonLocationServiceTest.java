package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.application.service.deliveryperson.LectureDeliveryPersonService;
import com.polytechnique.tiibntick.application.service.person.LecturePersonService;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository;
import com.polytechnique.tiibntick.infrastructure.search.DeliveryPersonDocument;
import com.polytechnique.tiibntick.infrastructure.search.DeliveryPersonSearchRepository;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class DeliveryPersonLocationServiceTest {

    @Mock
    private DeliveryPersonSearchRepository deliveryPersonSearchRepository;

    @Mock
    private DeliveryPersonRepository deliveryPersonRepository;

    @Mock
    private LectureDeliveryPersonService lectureDeliveryPersonService;

    @Mock
    private LecturePersonService lecturePersonService;

    @InjectMocks
    private DeliveryPersonLocationService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
