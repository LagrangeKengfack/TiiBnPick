package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.dtos.client.ClientDTO;
import com.polytechnique.ticbnpick.dtos.client.ClientResponseDTO;
import com.polytechnique.ticbnpick.models.Client;
import com.polytechnique.ticbnpick.models.Person;
import com.polytechnique.ticbnpick.repositories.ClientRepository;
import com.polytechnique.ticbnpick.repositories.PersonRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private PersonRepository personRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ClientService clientService;

    @Test
    void createClient_ShouldReturnClientResponseDTO() {
        ClientDTO clientDTO = new ClientDTO();
        clientDTO.setEmail("test@test.com");
        clientDTO.setPassword("password");
        clientDTO.setFirstName("John");
        clientDTO.setLastName("Doe");

        Person savedPerson = new Person();
        savedPerson.setId(UUID.randomUUID());
        savedPerson.setFirstName("John");
        savedPerson.setLastName("Doe");
        savedPerson.setEmail("test@test.com");

        Client savedClient = new Client();
        savedClient.setId(UUID.randomUUID());
        savedClient.setPersonId(savedPerson.getId());

        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(personRepository.save(any(Person.class))).thenReturn(Mono.just(savedPerson));
        when(clientRepository.save(any(Client.class))).thenReturn(Mono.just(savedClient));

        StepVerifier.create(clientService.createClient(clientDTO))
                .expectNextMatches(response -> 
                        response.getId().equals(savedClient.getId()) &&
                        response.getEmail().equals(savedPerson.getEmail()))
                .verifyComplete();
    }

    @Test
    void getAllClients_ShouldReturnFluxOfClients() {
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setPersonId(UUID.randomUUID());

        Person person = new Person();
        person.setId(client.getPersonId());
        person.setFirstName("Test");

        when(clientRepository.findAll()).thenReturn(Flux.just(client));
        when(personRepository.findById(client.getPersonId())).thenReturn(Mono.just(person));

        StepVerifier.create(clientService.getAllClients())
                .expectNextCount(1)
                .verifyComplete();
    }
}
