package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.dtos.auth.AuthRequestDTO;
import com.polytechnique.ticbnpick.dtos.auth.AuthResponseDTO;
import com.polytechnique.ticbnpick.exceptions.InvalidCredentialsException;
import com.polytechnique.ticbnpick.repositories.ClientRepository;
import com.polytechnique.ticbnpick.repositories.PersonRepository;
import com.polytechnique.ticbnpick.security.JwtUtil;
import com.polytechnique.ticbnpick.security.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * Service for authentication operations (login/logout).
 * 
 * @author TicBnPick Team
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final PersonRepository personRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request login credentials
     * @return authentication response with token and user info
     */
    public Mono<AuthResponseDTO> login(AuthRequestDTO request) {
        return personRepository.findByEmail(request.getEmail())
                .filter(person -> passwordEncoder.matches(request.getPassword(), person.getPassword()))
                .flatMap(person -> {
                    // Generate token with role
                    String role = person.getRole();
                    String token = jwtUtil.generateToken(person.getEmail(), role);
                    
                    // Create base response with Person data
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
                    response.setRole(role);

                    // Try to fetch Client details
                    return clientRepository.findByPersonId(person.getId())
                            .map(client -> {
                                response.setClientId(client.getId());
                                response.setLoyaltyStatus(client.getLoyaltyStatus());
                                return response;
                            })
                            // If not a client, just return the response as is
                            .defaultIfEmpty(response);
                })
                .switchIfEmpty(Mono.error(new InvalidCredentialsException("Invalid credentials")));
    }

    /**
     * Logs out a user by blacklisting their token.
     *
     * @param token the JWT token to invalidate
     * @return empty Mono on success
     */
    public Mono<Void> logout(String token) {
        return Mono.fromRunnable(() -> {
            try {
                tokenBlacklistService.blacklistToken(token, jwtUtil.getExpiration(token));
            } catch (Exception e) {
                // Token might be invalid or expired, ignore
            }
        });
    }
}
