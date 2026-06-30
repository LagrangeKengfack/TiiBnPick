package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.application.service.support.EmailService;
import com.polytechnique.tiibntick.application.service.support.FileStorageService;
import com.polytechnique.tiibntick.application.service.support.KafkaEventPublisher;
import com.polytechnique.tiibntick.domain.model.Address;
import com.polytechnique.tiibntick.domain.model.Announcement;
import com.polytechnique.tiibntick.domain.model.Packet;
import com.polytechnique.tiibntick.domain.model.enums.announcement.AnnouncementStatus;
import com.polytechnique.tiibntick.infrastructure.kafka.event.AnnouncementPublishedEvent;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.AddressRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.AnnouncementRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.AnnouncementSubscriptionRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PacketRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonRepository;
import com.polytechnique.tiibntick.infrastructure.web.dto.address.AddressDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementResponseDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.packet.PacketDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.subscription.SubscriptionResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AnnouncementServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private PacketRepository packetRepository;

    @Mock
    private KafkaEventPublisher kafkaEventPublisher;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private org.springframework.data.r2dbc.core.R2dbcEntityTemplate entityTemplate;

    @Mock
    private AnnouncementSubscriptionRepository subscriptionRepository;

    @Mock
    private DeliveryPersonRepository deliveryPersonRepository;

    @Mock
    private PersonRepository personRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AnnouncementService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
