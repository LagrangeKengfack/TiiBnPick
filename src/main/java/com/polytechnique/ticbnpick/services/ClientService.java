package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.dtos.ClientDTO;
import com.polytechnique.ticbnpick.dtos.ClientResponseDTO;
import com.polytechnique.ticbnpick.models.Client;
import com.polytechnique.ticbnpick.models.Person;
import com.polytechnique.ticbnpick.repositories.ClientRepository;
import com.polytechnique.ticbnpick.repositories.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Service layer for managing clients.
 * Handles business logic for client operations.
 *
 * @author Kenmeugne Michèle
 * @date 18/12/2025
 */
@Service
@RequiredArgsConstructor

public class ClientService {

    private final ClientRepository clientRepository;
    private final PersonRepository personRepository;

    /**
     * Creates a new client with associated person.
     *
     * @param clientDTO client data transfer object
     * @return created client response
     */
    public Mono<ClientResponseDTO> createClient(ClientDTO clientDTO) {
        // Create person first
        Person person = new Person();
        person.setLast_name(clientDTO.getLastName());
        person.setFirst_name(clientDTO.getFirstName());
        person.setPhone(clientDTO.getPhone());
        person.setEmail(clientDTO.getEmail());
        person.setPassword(clientDTO.getPassword());
        person.setNationalId(clientDTO.getNationalId());
        person.setPhotoCard(clientDTO.getPhotoCard());
        person.setCriminalRecord(clientDTO.getCriminalRecord());
        person.setRating(0.0);
        person.setTotalDeliveries(0);

        return personRepository.save(person)
                .flatMap(savedPerson -> {
                    // Create client with person_id
                    Client client = new Client();
                    client.setPersonId(savedPerson.getId());
                    client.setLoyaltyStatus(clientDTO.getLoyaltyStatus());

                    return clientRepository.save(client)
                            .map(savedClient -> mapToResponseDTO(savedClient, savedPerson));
                })
                .doOnSuccess(result -> {
                    // Log pour debug
                    System.out.println("Client created successfully: " + result.getId());
                })
                .doOnError(error -> {
                    // Log erreur
                    System.err.println("Error creating client: " + error.getMessage());
                })
                .cache(); // Force la completion de la transaction
    }

    /**
     * Retrieves a client by ID.
     *
     * @param id client identifier
     * @return client response or empty
     */
    public Mono<ClientResponseDTO> getClientById(UUID id) {
        return clientRepository.findById(id)
                .flatMap(client -> personRepository.findById(client.getPersonId())
                        .map(person -> mapToResponseDTO(client, person)));
    }

    /**
     * Retrieves all clients.
     *
     * @return flux of all clients
     */
    public Flux<ClientResponseDTO> getAllClients() {
        return clientRepository.findAll()
                .flatMap(client -> personRepository.findById(client.getPersonId())
                        .map(person -> mapToResponseDTO(client, person)));
    }

    /**
     * Updates an existing client.
     *
     * @param id        client identifier
     * @param clientDTO updated client data
     * @return updated client response or empty
     */
    public Mono<ClientResponseDTO> updateClient(UUID id, ClientDTO clientDTO) {
        return clientRepository.findById(id)
                .flatMap(existingClient -> personRepository.findById(existingClient.getPersonId())
                        .flatMap(existingPerson -> {
                            // Update person fields
                            existingPerson.setLast_name(clientDTO.getLastName());
                            existingPerson.setFirst_name(clientDTO.getFirstName());
                            existingPerson.setPhone(clientDTO.getPhone());
                            existingPerson.setEmail(clientDTO.getEmail());
                            existingPerson.setPassword(clientDTO.getPassword());
                            existingPerson.setNationalId(clientDTO.getNationalId());
                            existingPerson.setPhotoCard(clientDTO.getPhotoCard());
                            existingPerson.setCriminalRecord(clientDTO.getCriminalRecord());

                            return personRepository.save(existingPerson)
                                    .flatMap(updatedPerson -> {
                                        // Update client fields
                                        existingClient.setLoyaltyStatus(clientDTO.getLoyaltyStatus());

                                        return clientRepository.save(existingClient)
                                                .map(updatedClient -> mapToResponseDTO(updatedClient, updatedPerson));
                                    });
                        }));
    }

    /**
     * Deletes a client by ID.
     *
     * @param id client identifier
     * @return void mono
     */
    public Mono<Void> deleteClient(UUID id) {
        return clientRepository.findById(id)
                .flatMap(client -> clientRepository.deleteById(id)
                        .then(personRepository.deleteById(client.getPersonId())));
    }

    /**
     * Maps Client and Person entities to ClientResponseDTO.
     *
     * @param client client entity
     * @param person person entity
     * @return client response DTO
     */
    private ClientResponseDTO mapToResponseDTO(Client client, Person person) {
        ClientResponseDTO responseDTO = new ClientResponseDTO();
        responseDTO.setId(client.getId());
        responseDTO.setPersonId(person.getId());
        responseDTO.setLastName(person.getLast_name());
        responseDTO.setFirstName(person.getFirst_name());
        responseDTO.setPhone(person.getPhone());
        responseDTO.setEmail(person.getEmail());
        responseDTO.setNationalId(person.getNationalId());
        responseDTO.setPhotoCard(person.getPhotoCard());
        responseDTO.setCriminalRecord(person.getCriminalRecord());
        responseDTO.setRating(person.getRating());
        responseDTO.setTotalDeliveries(person.getTotalDeliveries());
        responseDTO.setLoyaltyStatus(client.getLoyaltyStatus());
        return responseDTO;
    }
}