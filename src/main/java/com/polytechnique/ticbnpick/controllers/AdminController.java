package com.polytechnique.ticbnpick.controllers;

import com.polytechnique.ticbnpick.dtos.auth.AuthResponseDTO;
import com.polytechnique.ticbnpick.dtos.admin.DashboardStatsDTO;
import com.polytechnique.ticbnpick.models.enums.deliveryPerson.DeliveryPersonStatus;
import com.polytechnique.ticbnpick.models.enums.PersonRole;
import com.polytechnique.ticbnpick.repositories.DeliveryPersonRepository;
import com.polytechnique.ticbnpick.repositories.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.UUID;
import com.polytechnique.ticbnpick.services.AdminDeliveryPersonService;
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

    private final AdminDeliveryPersonService adminDeliveryPersonService;
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
                deliveryPersonRepository.countByStatus(DeliveryPersonStatus.REJECTED))
                .map(tuple -> DashboardStatsDTO.builder()
                        .pendingCount(tuple.getT1())
                        .activeCount(tuple.getT2())
                        .suspendedCount(tuple.getT3())
                        .rejectedCount(tuple.getT4())
                        .build());
    }

    @GetMapping("/delivery-persons")
    public reactor.core.publisher.Flux<com.polytechnique.ticbnpick.models.DeliveryPerson> getDeliveryPersons(
            @RequestParam(required = false) DeliveryPersonStatus status) {
        if (status != null) {
            return deliveryPersonRepository.findAllByStatus(status);
        }
        return deliveryPersonRepository.findAll();
    }

    @PutMapping("/delivery-persons/validate")
    public Mono<Void> validateDeliveryPerson(
            @RequestBody com.polytechnique.ticbnpick.dtos.requests.AdminDeliveryPersonValidationRequest request) {
        return adminDeliveryPersonService.validateRegistration(request);
    }

    @PutMapping("/delivery-persons/{id}/suspend")
    public Mono<Void> suspendDeliveryPerson(@PathVariable UUID id) {
        return adminDeliveryPersonService.suspendDeliveryPerson(id);
    }

    @PutMapping("/delivery-persons/{id}/revoke")
    public Mono<Void> revokeDeliveryPerson(@PathVariable UUID id) {
        return adminDeliveryPersonService.revokeDeliveryPerson(id);
    }

}
