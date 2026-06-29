package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.port.in.ClientUseCase;
import com.polytechnique.tiibntick.domain.exception.ResourceNotFoundException;
import com.polytechnique.tiibntick.domain.model.Client;
import com.polytechnique.tiibntick.domain.model.Person;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.ClientRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonRepository;
import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Application use case implementation for client management.
 * Implements the ClientUseCase inbound port.
 */
@Service
@RequiredArgsConstructor
public class ClientUseCaseImpl implements ClientUseCase {

    private final ClientRepository clientRepository;
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Mono<ClientResponseDTO> createClient(ClientDTO clientDTO) {
        Person person = new Person();
        person.setLastName(clientDTO.getLastName());
        person.setFirstName(clientDTO.getFirstName());
        person.setPhone(clientDTO.getPhone());
        person.setEmail(clientDTO.getEmail());
        person.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
        person.setNationalId(clientDTO.getNationalId());
        person.setPhotoCard(clientDTO.getPhotoCard());
        person.setCriminalRecord(clientDTO.getCriminalRecord());
        person.setRating(0.0);
        person.setTotalDeliveries(0);
        person.setRole("CLIENT");

        return personRepository.save(person)
                .flatMap(savedPerson -> {
                    Client client = new Client();
                    client.setPersonId(savedPerson.getId());
                    client.setLoyaltyStatus(clientDTO.getLoyaltyStatus());
                    return clientRepository.save(client)
                            .map(savedClient -> mapToResponseDTO(savedClient, savedPerson));
                });
    }

    @Override
    public Mono<ClientResponseDTO> getClientById(UUID id) {
        return clientRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Client", "id", id)))
                .flatMap(client -> personRepository.findById(client.getPersonId())
                        .switchIfEmpty(Mono.error(new ResourceNotFoundException("Person", "id", client.getPersonId())))
                        .map(person -> mapToResponseDTO(client, person)));
    }

    @Override
    public Flux<ClientResponseDTO> getAllClients() {
        return clientRepository.findAll()
                .flatMap(client -> personRepository.findById(client.getPersonId())
                        .map(person -> mapToResponseDTO(client, person)));
    }

    @Override
    public Mono<ClientResponseDTO> updateClient(UUID id, ClientDTO clientDTO) {
        return clientRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Client", "id", id)))
                .flatMap(existingClient -> personRepository.findById(existingClient.getPersonId())
                        .switchIfEmpty(Mono.error(
                                new ResourceNotFoundException("Person", "id", existingClient.getPersonId())))
                        .flatMap(existingPerson -> {
                            existingPerson.setNewEntity(false);
                            existingPerson.setLastName(clientDTO.getLastName());
                            existingPerson.setFirstName(clientDTO.getFirstName());
                            existingPerson.setPhone(clientDTO.getPhone());
                            existingPerson.setEmail(clientDTO.getEmail());
                            if (clientDTO.getPassword() != null && !clientDTO.getPassword().isEmpty()) {
                                existingPerson.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
                            }
                            existingPerson.setNationalId(clientDTO.getNationalId());
                            existingPerson.setPhotoCard(clientDTO.getPhotoCard());
                            existingPerson.setCriminalRecord(clientDTO.getCriminalRecord());

                            return personRepository.save(existingPerson)
                                    .flatMap(updatedPerson -> {
                                        existingClient.setLoyaltyStatus(clientDTO.getLoyaltyStatus());
                                        return clientRepository.save(existingClient)
                                                .map(updatedClient -> mapToResponseDTO(updatedClient, updatedPerson));
                                    });
                        }));
    }

    @Override
    public Mono<Void> deleteClient(UUID id) {
        return clientRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Client", "id", id)))
                .flatMap(client -> clientRepository.deleteById(id)
                        .then(personRepository.deleteById(client.getPersonId())));
    }

    @Override
    public Mono<Boolean> checkEmailExists(String email) {
        return personRepository.existsByEmail(email);
    }

    @Override
    public Mono<Boolean> checkNationalIdExists(String nationalId) {
        return personRepository.existsByNationalId(nationalId);
    }

    private ClientResponseDTO mapToResponseDTO(Client client, Person person) {
        ClientResponseDTO responseDTO = new ClientResponseDTO();
        responseDTO.setId(client.getId());
        responseDTO.setPersonId(person.getId());
        responseDTO.setLastName(person.getLastName());
        responseDTO.setFirstName(person.getFirstName());
        responseDTO.setPhone(person.getPhone());
        responseDTO.setEmail(person.getEmail());
        responseDTO.setNationalId(person.getNationalId());
        responseDTO.setPhotoCard(person.getPhotoCard());
        responseDTO.setCriminalRecord(person.getCriminalRecord());
        responseDTO.setRating(person.getRating());
        responseDTO.setTotalDeliveries(person.getTotalDeliveries());
        responseDTO.setLoyaltyStatus(client.getLoyaltyStatus());
        responseDTO.setStatus(client.getStatus() != null ? client.getStatus().getValue() : "ACTIVE");
        return responseDTO;
    }
}
