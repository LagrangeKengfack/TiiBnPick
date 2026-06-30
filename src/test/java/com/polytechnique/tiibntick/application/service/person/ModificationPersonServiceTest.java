package com.polytechnique.tiibntick.application.service.person;

import com.polytechnique.tiibntick.domain.model.Person;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonRepository;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class ModificationPersonServiceTest {

    @Mock
    private PersonRepository personRepository;

    @InjectMocks
    private ModificationPersonService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
