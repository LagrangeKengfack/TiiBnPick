package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.auth.AuthResponseDTO;
import com.polytechnique.tiibntick.dtos.admin.DashboardStatsDTO;
import com.polytechnique.tiibntick.models.enums.deliveryPerson.DeliveryPersonStatus;
import com.polytechnique.tiibntick.models.enums.PersonRole;
import com.polytechnique.tiibntick.repositories.DeliveryPersonRepository;
import com.polytechnique.tiibntick.repositories.PersonRepository;
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
 * @author TiiBnTick Team
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PersonRepository personRepository;
    private final DeliveryPersonRepository deliveryPersonRepository;

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

    @GetMapping("/dashboard-stats")
    public Mono<DashboardStatsDTO> getDashboardStats() {
        return Mono.zip(
                deliveryPersonRepository.countByStatus(DeliveryPersonStatus.PENDING),
                deliveryPersonRepository.countByStatusAndIsActive(DeliveryPersonStatus.APPROVED, true),
                deliveryPersonRepository.countByStatus(DeliveryPersonStatus.SUSPENDED),
                deliveryPersonRepository.countByStatus(DeliveryPersonStatus.REJECTED),
                deliveryPersonRepository.countByStatus(DeliveryPersonStatus.REVOKED))
                .map(tuple -> DashboardStatsDTO.builder()
                        .pendingCount(tuple.getT1())
                        .activeCount(tuple.getT2())
                        .suspendedCount(tuple.getT3())
                        .rejectedCount(tuple.getT4())
                        .revokedCount(tuple.getT5())
                        .build());
    }

}
