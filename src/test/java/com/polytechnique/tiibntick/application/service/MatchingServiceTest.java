package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.model.DeliveryPerson;
import com.polytechnique.tiibntick.infrastructure.kafka.event.AnnouncementPublishedEvent;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository;
import com.polytechnique.tiibntick.infrastructure.search.AnnouncementDocument;
import com.polytechnique.tiibntick.infrastructure.search.AnnouncementSearchRepository;
import com.polytechnique.tiibntick.infrastructure.search.DeliveryPersonDocument;
import com.polytechnique.tiibntick.infrastructure.search.DeliveryPersonSearchRepository;
import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private AnnouncementSearchRepository announcementSearchRepository;

    @Mock
    private DeliveryPersonSearchRepository deliveryPersonSearchRepository;

    @Mock
    private DeliveryPersonRepository deliveryPersonRepository;

    @Mock
    private NotificationService notificationService;

    private MatchingService service;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        service = new MatchingService(
            java.util.Optional.empty(),
            java.util.Optional.empty(),
            deliveryPersonRepository,
            notificationService
        );
    }

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
