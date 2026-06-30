package com.polytechnique.tiibntick.application.service.logistics;

import com.polytechnique.tiibntick.domain.model.Logistics;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.LogisticsRepository;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class CreationLogisticsServiceTest {

    @Mock
    private LogisticsRepository logisticsRepository;

    @InjectMocks
    private CreationLogisticsService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
