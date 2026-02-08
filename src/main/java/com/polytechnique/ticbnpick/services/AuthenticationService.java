package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.dtos.auth.AuthRequestDTO;
import com.polytechnique.ticbnpick.dtos.auth.AuthResponseDTO;
import com.polytechnique.ticbnpick.exceptions.InvalidCredentialsException;
import com.polytechnique.ticbnpick.repositories.ClientRepository;
import com.polytechnique.ticbnpick.repositories.DeliveryPersonRepository;
import com.polytechnique.ticbnpick.repositories.PersonRepository;
import com.polytechnique.ticbnpick.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final PersonRepository personRepository;
    private final ClientRepository clientRepository;
    private final DeliveryPersonRepository deliveryPersonRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Mono<AuthResponseDTO> login(AuthRequestDTO request) {
        return personRepository.findByEmail(request.getEmail())
                .switchIfEmpty(Mono.error(new InvalidCredentialsException("Email non trouvé")))
                .flatMap(person -> {
                    if (!passwordEncoder.matches(request.getPassword(), person.getPassword())) {
                        return Mono.error(new InvalidCredentialsException("Mot de passe incorrect"));
                    }

                    String token = jwtUtil.generateToken(person.getEmail());

                    AuthResponseDTO response = new AuthResponseDTO();
                    response.setToken(token);
                    response.setId(person.getId());
                    response.setLastName(person.getLastName());
                    response.setFirstName(person.getFirstName());
                    response.setEmail(person.getEmail());
                    response.setPhone(person.getPhone());
                    response.setPhotoCard(person.getPhotoCard());
                    response.setNationalId(person.getNationalId());
                    response.setCriminalRecord(person.getCriminalRecord());
                    response.setRating(person.getRating());
                    response.setTotalDeliveries(person.getTotalDeliveries());
                    response.setIsActive(person.getIsActive());

                    // Check if Client
                    return clientRepository.findByPersonId(person.getId())
                            .map(client -> {
                                response.setClientId(client.getId());
                                response.setLoyaltyStatus(client.getLoyaltyStatus());
                                response.setUserType("CLIENT");
                                return response;
                            })
                            .switchIfEmpty(
                                    // Check if DeliveryPerson
                                    deliveryPersonRepository.findByPersonId(person.getId())
                                            .map(deliveryPerson -> {
                                                response.setDeliveryPersonId(deliveryPerson.getId());
                                                response.setUserType("LIVREUR");
                                                response.setIsActive(deliveryPerson.getIsActive());
                                                return response;
                                            }))
                            .defaultIfEmpty(response.getUserType() == null ? setDefaultAdmin(response) : response);
                });
    }

    private AuthResponseDTO setDefaultAdmin(AuthResponseDTO response) {
        response.setUserType("ADMIN");
        return response;
    }
}
