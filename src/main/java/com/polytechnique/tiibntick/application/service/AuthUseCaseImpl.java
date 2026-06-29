package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.port.in.AuthUseCase;
import com.polytechnique.tiibntick.domain.exception.InvalidCredentialsException;
import com.polytechnique.tiibntick.domain.model.enums.client.ClientStatus;
import com.polytechnique.tiibntick.domain.model.enums.deliveryPerson.DeliveryPersonStatus;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.ClientRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonRepository;
import com.polytechnique.tiibntick.infrastructure.config.security.JwtUtil;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthRequestDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Application use case implementation for authentication.
 * Implements the AuthUseCase inbound port.
 */
@Service
@RequiredArgsConstructor
public class AuthUseCaseImpl implements AuthUseCase {

    private final PersonRepository personRepository;
    private final ClientRepository clientRepository;
    private final DeliveryPersonRepository deliveryPersonRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public Mono<AuthResponseDTO> login(AuthRequestDTO request) {
        return personRepository.findByEmail(request.getEmail())
                .switchIfEmpty(Mono.error(new InvalidCredentialsException("Email ou mot de passe incorrect")))
                .flatMap(person -> {
                    if (!passwordEncoder.matches(request.getPassword(), person.getPassword())) {
                        return Mono.error(new InvalidCredentialsException("Email ou mot de passe incorrect"));
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

                    return clientRepository.findByPersonId(person.getId())
                            .flatMap(client -> {
                                if (client.getStatus() == ClientStatus.SUSPENDED) {
                                    return Mono.error(new InvalidCredentialsException("Votre compte a été suspendu"));
                                }
                                if (client.getStatus() == ClientStatus.REVOKED) {
                                    return Mono.error(new InvalidCredentialsException("Votre compte a été bloqué"));
                                }
                                response.setClientId(client.getId());
                                response.setLoyaltyStatus(client.getLoyaltyStatus());
                                response.setUserType("CLIENT");
                                return Mono.just(response);
                            })
                            .switchIfEmpty(deliveryPersonRepository.findByPersonId(person.getId())
                                    .flatMap(deliveryPerson -> {
                                        if (deliveryPerson.getStatus() == DeliveryPersonStatus.SUSPENDED) {
                                            return Mono.error(
                                                    new InvalidCredentialsException("Votre compte a été suspendu"));
                                        }
                                        if (deliveryPerson.getStatus() == DeliveryPersonStatus.REVOKED) {
                                            return Mono.error(
                                                    new InvalidCredentialsException("Votre compte a été bloqué"));
                                        }
                                        if (deliveryPerson.getStatus() == DeliveryPersonStatus.REJECTED) {
                                            return Mono.error(
                                                    new InvalidCredentialsException("Votre compte a été rejeté"));
                                        }
                                        response.setDeliveryPersonId(deliveryPerson.getId());
                                        response.setUserType("LIVREUR");
                                        response.setIsActive(deliveryPerson.getIsActive());
                                        return Mono.just(response);
                                    }))
                            .defaultIfEmpty(response.getUserType() == null ? setDefaultAdmin(response) : response)
                            .map(finalResponse -> {
                                Map<String, Object> claims = new HashMap<>();
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

    @Override
    public Mono<Void> logout(String token) {
        return Mono.empty();
    }

    private AuthResponseDTO setDefaultAdmin(AuthResponseDTO response) {
        response.setUserType("ADMIN");
        response.setRole("ADMIN");
        return response;
    }
}
