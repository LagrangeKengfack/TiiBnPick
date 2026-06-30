package com.polytechnique.tiibntick.application.service.support;

import com.polytechnique.tiibntick.domain.exception.InvalidTokenException;
import com.polytechnique.tiibntick.domain.exception.ResourceNotFoundException;
import com.polytechnique.tiibntick.domain.model.PasswordToken;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PasswordTokenRepository;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private PasswordTokenRepository passwordTokenRepository;

    @InjectMocks
    private TokenService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
