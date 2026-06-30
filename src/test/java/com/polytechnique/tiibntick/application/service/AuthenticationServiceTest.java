package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.exception.InvalidCredentialsException;
import com.polytechnique.tiibntick.infrastructure.config.security.JwtUtil;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.ClientRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonRepository;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthResponseDTO;
import reactor.core.publisher.Mono;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private PersonRepository personRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private DeliveryPersonRepository deliveryPersonRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthenticationService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
