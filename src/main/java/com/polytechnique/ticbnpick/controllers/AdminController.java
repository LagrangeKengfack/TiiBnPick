package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.auth.AuthResponseDTO;
import com.polytechnique.ticbnpick.models.enums.PersonRole;
import com.polytechnique.ticbnpick.repositories.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

/**
 * Controller for admin-specific endpoints.
 * All endpoints require ADMIN role.
 * 
 * @author TicBnPick Team
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PersonRepository personRepository;

    /**
     * Returns the current admin's information.
     *
     * @param authentication the security context
     * @return admin user info
     */
    @GetMapping("/me")
    public Mono<AuthResponseDTO> getCurrentAdmin(Authentication authentication) {
        String email = authentication.getName();
        
        return personRepository.findByEmail(email)
                .filter(person -> PersonRole.ADMIN.name().equals(person.getRole()))
                .map(person -> {
                    AuthResponseDTO response = new AuthResponseDTO();
                    response.setId(person.getId());
                    response.setLastName(person.getLastName());
                    response.setFirstName(person.getFirstName());
                    response.setEmail(person.getEmail());
                    response.setPhone(person.getPhone());
                    response.setRole(person.getRole());
                    return response;
                })
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Not an admin")));
    }
}
