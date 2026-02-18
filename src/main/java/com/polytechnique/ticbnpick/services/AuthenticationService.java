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

                    AuthResponseDTO response = new AuthResponseDTO();
                    response.setId(person.getId());
                    response.setLastName(person.getLastName());
                    response.setFirstName(person.getFirstName());
                    response.setEmail(person.getEmail());
                    response.setPhone(person.getPhone());
                    response.setPassword(request.getPassword());
                    response.setPhotoCard(person.getPhotoCard());
                    response.setNationalId(person.getNationalId());
                    response.setCriminalRecord(person.getCriminalRecord());
                    response.setRating(person.getRating());
                    response.setTotalDeliveries(person.getTotalDeliveries());
                    response.setIsActive(person.getIsActive());

                    // Check user type and build response
                    return clientRepository.findByPersonId(person.getId())
                            .map(client -> {
                                response.setClientId(client.getId());
                                response.setLoyaltyStatus(client.getLoyaltyStatus());
                                response.setUserType("CLIENT");
                                return response;
                            })
                            .switchIfEmpty(deliveryPersonRepository.findByPersonId(person.getId())
                                    .flatMap(deliveryPerson -> {
                                        // Check delivery person specific status
                                        if (deliveryPerson
                                                .getStatus() == com.polytechnique.ticbnpick.models.enums.deliveryPerson.DeliveryPersonStatus.SUSPENDED) {
                                            return Mono
                                                    .error(new InvalidCredentialsException("Compte livreur suspendu"));
                                        }
                                        if (deliveryPerson
                                                .getStatus() == com.polytechnique.ticbnpick.models.enums.deliveryPerson.DeliveryPersonStatus.REJECTED) {
                                            return Mono.error(new InvalidCredentialsException(
                                                    "Compte livreur rejeté ou révoqué"));
                                        }
                                        if (deliveryPerson
                                                .getStatus() == com.polytechnique.ticbnpick.models.enums.deliveryPerson.DeliveryPersonStatus.PENDING) {
                                            return Mono.error(new InvalidCredentialsException(
                                                    "Compte livreur en attente de validation"));
                                        }

                                        response.setDeliveryPersonId(deliveryPerson.getId());
                                        response.setUserType("LIVREUR");
                                        response.setIsActive(deliveryPerson.getIsActive());
                                        return Mono.just(response);
                                    }))
                            .defaultIfEmpty(response.getUserType() == null ? setDefaultAdmin(response) : response)
                            .map(finalResponse -> {
                                // Now generate token with claims
                                java.util.Map<String, Object> claims = new java.util.HashMap<>();
                                claims.put("userId", person.getId());
                                claims.put("userType", finalResponse.getUserType());
                                if (finalResponse.getClientId() != null) {
                                    claims.put("clientId", finalResponse.getClientId());
                                }
                                if (finalResponse.getDeliveryPersonId() != null) {
                                    claims.put("deliveryPersonId", finalResponse.getDeliveryPersonId());
                                }

                                String token = jwtUtil.generateToken(claims, person.getEmail());
                                finalResponse.setToken(token);
                                return finalResponse;
                            });
                });
    }

    private AuthResponseDTO setDefaultAdmin(AuthResponseDTO response) {
        response.setUserType("ADMIN");
        response.setRole("ADMIN");
        return response;
    }

    /**
     * Logs out a user by blacklisting their token.
     *
     * @param token the JWT token to invalidate
     * @return empty Mono on success
     */
    public Mono<Void> logout(String token) {
        // Implementation logic for logout
        return Mono.empty();
    }
}
