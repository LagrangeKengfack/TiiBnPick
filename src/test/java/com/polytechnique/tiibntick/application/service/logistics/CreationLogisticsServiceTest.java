package com.polytechnique.tiibntick.application.service.logistics;

import com.polytechnique.tiibntick.domain.model.Logistics;
import com.polytechnique.tiibntick.domain.model.OpeningHours;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.LogisticsRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.OpeningHoursRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CreationLogisticsServiceTest {

    @Mock
    private LogisticsRepository logisticsRepository;

    @Mock
    private OpeningHoursRepository openingHoursRepository;

    @InjectMocks
    private CreationLogisticsService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }

    @Test
    void createLogistics_withOpeningHours() {
        Logistics logistics = new Logistics();
        logistics.setId(UUID.randomUUID());
        OpeningHours oh = new OpeningHours();
        logistics.setOpeningHours(List.of(oh));

        when(logisticsRepository.save(any(Logistics.class))).thenReturn(Mono.just(logistics));
        when(openingHoursRepository.save(any(OpeningHours.class))).thenReturn(Mono.just(oh));

        StepVerifier.create(service.createLogistics(logistics))
                .expectNextMatches(saved -> saved.getOpeningHours() != null && !saved.getOpeningHours().isEmpty())
                .verifyComplete();
    }
}
