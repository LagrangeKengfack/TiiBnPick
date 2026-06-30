package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.application.service.support.EmailService;
import com.polytechnique.tiibntick.application.service.support.KafkaEventPublisher;
import com.polytechnique.tiibntick.application.service.support.PushNotificationService;
import com.polytechnique.tiibntick.domain.model.Notification;
import com.polytechnique.tiibntick.domain.model.enums.notification.NotificationStatus;
import com.polytechnique.tiibntick.domain.model.enums.notification.NotificationType;
import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.NotificationRepository;
import com.polytechnique.tiibntick.infrastructure.search.AnnouncementDocument;
import com.polytechnique.tiibntick.infrastructure.search.DeliveryPersonDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PushNotificationService pushNotificationService;

    @Mock
    private KafkaEventPublisher kafkaEventPublisher;

    @InjectMocks
    private NotificationService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
