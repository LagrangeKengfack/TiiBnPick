package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.port.in.AdminUseCase;
import com.polytechnique.tiibntick.domain.model.enums.PersonRole;
import com.polytechnique.tiibntick.domain.model.enums.deliveryPerson.DeliveryPersonStatus;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.DeliveryPersonRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonRepository;
import com.polytechnique.tiibntick.infrastructure.web.dto.admin.DashboardStatsDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

/**
 * Application use case implementation for admin operations.
 * Implements the AdminUseCase inbound port.
 */
@Service
@RequiredArgsConstructor
public class AdminUseCaseImpl implements AdminUseCase {

    private final PersonRepository personRepository;
    private final DeliveryPersonRepository deliveryPersonRepository;

    @Override
    public Mono<AuthResponseDTO> getCurrentAdmin(String email) {
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

    @Override
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
