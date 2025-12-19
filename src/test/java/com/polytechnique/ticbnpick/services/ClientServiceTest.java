package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.dtos.ClientDTO;
import com.polytechnique.ticbnpick.dtos.ClientResponseDTO;
import com.polytechnique.ticbnpick.models.Client;
import com.polytechnique.ticbnpick.models.Person;
import com.polytechnique.ticbnpick.repositories.ClientRepository;
import com.polytechnique.ticbnpick.repositories.PersonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Client Service Tests")
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private PersonRepository personRepository;

    @InjectMocks
    private ClientService clientService;

    private ClientDTO clientDTO;
    private Person person;
    private Client client;
    private UUID personId;
    private UUID clientId;

    @BeforeEach
    void setUp() {
        personId = UUID.randomUUID();
        clientId = UUID.randomUUID();

        clientDTO = new ClientDTO();
        clientDTO.setLastName("Doe");
        clientDTO.setFirstName("John");
        clientDTO.setPhone("+237690123456");
        clientDTO.setEmail("john.doe@example.com");
        clientDTO.setPassword("SecurePass123!");
        clientDTO.setNationalId("CM-123456789");
        clientDTO.setPhotoCard("https://example.com/photo.jpg");
        clientDTO.setCriminalRecord(null);
        clientDTO.setLoyaltyStatus("BRONZE");

        person = new Person();
        person.setId(personId);
        person.setLast_name("Doe");
        person.setFirst_name("John");
        person.setPhone("+237690123456");
        person.setEmail("john.doe@example.com");
        person.setPassword("SecurePass123!");
        person.setNationalId("CM-123456789");
        person.setPhotoCard("https://example.com/photo.jpg");
        person.setRating(0.0);
        person.setTotalDeliveries(0);

        client = new Client();
        client.setId(clientId);
        client.setPersonId(personId);
        client.setLoyaltyStatus("BRONZE");
    }

    @Test
    @DisplayName("Should create client successfully")
    void shouldCreateClientSuccessfully() {
        when(personRepository.save(any(Person.class))).thenReturn(Mono.just(person));
        when(clientRepository.save(any(Client.class))).thenReturn(Mono.just(client));

        Mono<ClientResponseDTO> result = clientService.createClient(clientDTO);

        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response).isNotNull();
                    assertThat(response.getId()).isEqualTo(clientId);
                    assertThat(response.getPersonId()).isEqualTo(personId);
                    assertThat(response.getLastName()).isEqualTo("Doe");
                    assertThat(response.getFirstName()).isEqualTo("John");
                    assertThat(response.getEmail()).isEqualTo("john.doe@example.com");
                    assertThat(response.getLoyaltyStatus()).isEqualTo("BRONZE");
                    assertThat(response.getRating()).isEqualTo(0.0);
                    assertThat(response.getTotalDeliveries()).isEqualTo(0);
                })
                .verifyComplete();

        verify(personRepository, times(1)).save(any(Person.class));
        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    @DisplayName("Should get client by ID successfully")
    void shouldGetClientByIdSuccessfully() {
        // CORRECTION ICI : Utiliser eq() au lieu de any() pour UUID
        when(clientRepository.findById(eq(clientId))).thenReturn(Mono.just(client));
        when(personRepository.findById(eq(personId))).thenReturn(Mono.just(person));

        Mono<ClientResponseDTO> result = clientService.getClientById(clientId);

        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response).isNotNull();
                    assertThat(response.getId()).isEqualTo(clientId);
                    assertThat(response.getLastName()).isEqualTo("Doe");
                    assertThat(response.getEmail()).isEqualTo("john.doe@example.com");
                })
                .verifyComplete();

        verify(clientRepository, times(1)).findById(clientId);
        verify(personRepository, times(1)).findById(personId);
    }

    @Test
    @DisplayName("Should return empty when client not found")
    void shouldReturnEmptyWhenClientNotFound() {
        when(clientRepository.findById(eq(clientId))).thenReturn(Mono.empty());

        Mono<ClientResponseDTO> result = clientService.getClientById(clientId);

        StepVerifier.create(result)
                .verifyComplete();

        verify(clientRepository, times(1)).findById(clientId);
        verify(personRepository, never()).findById(any(UUID.class));
    }

    @Test
    @DisplayName("Should get all clients successfully")
    void shouldGetAllClientsSuccessfully() {
        Client client2 = new Client();
        UUID client2Id = UUID.randomUUID();
        UUID person2Id = UUID.randomUUID();
        client2.setId(client2Id);
        client2.setPersonId(person2Id);
        client2.setLoyaltyStatus("GOLD");

        Person person2 = new Person();
        person2.setId(person2Id);
        person2.setLast_name("Smith");
        person2.setFirst_name("Jane");
        person2.setEmail("jane.smith@example.com");
        person2.setPhone("+237690999999");
        person2.setPassword("Pass123!");
        person2.setNationalId("CM-987654321");
        person2.setPhotoCard("https://example.com/photo2.jpg");
        person2.setRating(4.5);
        person2.setTotalDeliveries(10);

        when(clientRepository.findAll()).thenReturn(Flux.just(client, client2));
        when(personRepository.findById(eq(personId))).thenReturn(Mono.just(person));
        when(personRepository.findById(eq(person2Id))).thenReturn(Mono.just(person2));

        Flux<ClientResponseDTO> result = clientService.getAllClients();

        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response.getId()).isEqualTo(clientId);
                    assertThat(response.getLastName()).isEqualTo("Doe");
                })
                .assertNext(response -> {
                    assertThat(response.getId()).isEqualTo(client2Id);
                    assertThat(response.getLastName()).isEqualTo("Smith");
                })
                .verifyComplete();

        verify(clientRepository, times(1)).findAll();
        verify(personRepository, times(2)).findById(any(UUID.class));
    }

    @Test
    @DisplayName("Should update client successfully")
    void shouldUpdateClientSuccessfully() {
        ClientDTO updatedDTO = new ClientDTO();
        updatedDTO.setLastName("Doe Updated");
        updatedDTO.setFirstName("John Modified");
        updatedDTO.setPhone("+237699999999");
        updatedDTO.setEmail("john.updated@example.com");
        updatedDTO.setPassword("NewPass123!");
        updatedDTO.setNationalId("CM-123456789");
        updatedDTO.setPhotoCard("https://example.com/new-photo.jpg");
        updatedDTO.setCriminalRecord("Clean");
        updatedDTO.setLoyaltyStatus("GOLD");

        Person updatedPerson = new Person();
        updatedPerson.setId(personId);
        updatedPerson.setLast_name("Doe Updated");
        updatedPerson.setFirst_name("John Modified");
        updatedPerson.setPhone("+237699999999");
        updatedPerson.setEmail("john.updated@example.com");
        updatedPerson.setPassword("NewPass123!");
        updatedPerson.setNationalId("CM-123456789");
        updatedPerson.setPhotoCard("https://example.com/new-photo.jpg");
        updatedPerson.setCriminalRecord("Clean");
        updatedPerson.setRating(0.0);
        updatedPerson.setTotalDeliveries(0);

        Client updatedClient = new Client();
        updatedClient.setId(clientId);
        updatedClient.setPersonId(personId);
        updatedClient.setLoyaltyStatus("GOLD");

        when(clientRepository.findById(eq(clientId))).thenReturn(Mono.just(client));
        when(personRepository.findById(eq(personId))).thenReturn(Mono.just(person));
        when(personRepository.save(any(Person.class))).thenReturn(Mono.just(updatedPerson));
        when(clientRepository.save(any(Client.class))).thenReturn(Mono.just(updatedClient));

        Mono<ClientResponseDTO> result = clientService.updateClient(clientId, updatedDTO);

        StepVerifier.create(result)
                .assertNext(response -> {
                    assertThat(response).isNotNull();
                    assertThat(response.getId()).isEqualTo(clientId);
                    assertThat(response.getLoyaltyStatus()).isEqualTo("GOLD");
                })
                .verifyComplete();

        verify(clientRepository, times(1)).findById(clientId);
        verify(personRepository, times(1)).findById(personId);
        verify(personRepository, times(1)).save(any(Person.class));
        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    @DisplayName("Should delete client successfully")
    void shouldDeleteClientSuccessfully() {
        when(clientRepository.findById(eq(clientId))).thenReturn(Mono.just(client));
        when(clientRepository.deleteById(eq(clientId))).thenReturn(Mono.empty());
        when(personRepository.deleteById(eq(personId))).thenReturn(Mono.empty());

        Mono<Void> result = clientService.deleteClient(clientId);

        StepVerifier.create(result)
                .verifyComplete();

        verify(clientRepository, times(1)).findById(clientId);
        verify(clientRepository, times(1)).deleteById(clientId);
        verify(personRepository, times(1)).deleteById(personId);
    }

    @Test
    @DisplayName("Should handle delete when client not found")
    void shouldHandleDeleteWhenClientNotFound() {
        when(clientRepository.findById(eq(clientId))).thenReturn(Mono.empty());

        Mono<Void> result = clientService.deleteClient(clientId);

        StepVerifier.create(result)
                .verifyComplete();

        verify(clientRepository, times(1)).findById(clientId);
        verify(clientRepository, never()).deleteById(any(UUID.class));
        verify(personRepository, never()).deleteById(any(UUID.class));
    }

    @Test
    @DisplayName("Should handle error when creating client with duplicate email")
    void shouldHandleErrorWhenCreatingClientWithDuplicateEmail() {
        when(personRepository.save(any(Person.class)))
                .thenReturn(Mono.error(new RuntimeException("Duplicate key error")));

        Mono<ClientResponseDTO> result = clientService.createClient(clientDTO);

        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();

        verify(personRepository, times(1)).save(any(Person.class));
        verify(clientRepository, never()).save(any(Client.class));
    }
}