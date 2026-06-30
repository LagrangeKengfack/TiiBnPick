package com.polytechnique.tiibntick.application.service.support;

import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class NotificationStreamServiceTest {

    @Mock
    private java.util.Map<java.util.UUID, Sinks.Many<MatchingNotificationEvent>> clientSinks;

    @InjectMocks
    private NotificationStreamService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
