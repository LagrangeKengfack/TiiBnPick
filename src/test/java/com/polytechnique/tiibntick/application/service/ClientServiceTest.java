package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.exception.ResourceNotFoundException;
import com.polytechnique.tiibntick.domain.model.Client;
import com.polytechnique.tiibntick.domain.model.Person;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.ClientRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonRepository;
import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private PersonRepository personRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ClientService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
