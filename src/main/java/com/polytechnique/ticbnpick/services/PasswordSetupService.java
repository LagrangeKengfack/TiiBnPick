package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.dtos.requests.SetPasswordRequest;
import com.polytechnique.ticbnpick.services.person.LecturePersonService;
import com.polytechnique.ticbnpick.services.person.ModificationPersonService;
import com.polytechnique.ticbnpick.services.support.PasswordHasherService;
import com.polytechnique.ticbnpick.services.support.TokenService;
import com.polytechnique.ticbnpick.validators.SetPasswordValidator;
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
     * @throws com.polytechnique.ticbnpick.exceptions.InvalidTokenException if the token is invalid or expired
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
