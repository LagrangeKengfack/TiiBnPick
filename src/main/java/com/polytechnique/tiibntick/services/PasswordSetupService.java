package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.requests.SetPasswordRequest;
import com.polytechnique.tiibntick.services.person.LecturePersonService;
import com.polytechnique.tiibntick.services.person.ModificationPersonService;
import com.polytechnique.tiibntick.services.support.PasswordHasherService;
import com.polytechnique.tiibntick.services.support.TokenService;
import com.polytechnique.tiibntick.validators.SetPasswordValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * Orchestrator service for Password Setup flow.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Service
@RequiredArgsConstructor
public class PasswordSetupService {

    private final TokenService tokenService;
    private final LecturePersonService lecturePersonService;
    private final ModificationPersonService modificationPersonService;
    private final PasswordHasherService passwordHasherService;
    private final SetPasswordValidator validator;

    /**
     * Sets the password for a user using a valid token.
     *
     * Validates the token, hashes the new password, updates the Person entity,
     * and invalidates the token.
     *
     * @param request the request containing the token and new password
     * @return a Mono<Void> signaling completion
     * @throws com.polytechnique.tiibntick.exceptions.InvalidTokenException if the token is invalid or expired
     */
    public Mono<Void> setPassword(SetPasswordRequest request) {
        return validator.validate(request)
                .then(tokenService.validateToken(request.getToken()))
                .then(tokenService.getToken(request.getToken()))
                .flatMap(tokenEntity -> lecturePersonService.findById(tokenEntity.getPersonId())
                        .flatMap(person -> {
                            String encodedPassword = passwordHasherService.encode(request.getNewPassword());
                            person.setPassword(encodedPassword);
                            return modificationPersonService.updatePerson(person);
                        })
                        .flatMap(updatedPerson -> tokenService.expireToken(request.getToken())));
    }
}
