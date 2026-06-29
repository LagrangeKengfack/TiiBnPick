package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.domain.port.in.AdminUseCase;
import com.polytechnique.tiibntick.infrastructure.web.dto.admin.DashboardStatsDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

/**
 * Inbound REST adapter for admin-specific endpoints.
 * All endpoints require ADMIN role.
 * Delegates to the AdminUseCase inbound port.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminUseCase adminUseCase;

    @GetMapping("/me")
    public Mono<AuthResponseDTO> getCurrentAdmin(Authentication authentication) {
        return adminUseCase.getCurrentAdmin(authentication.getName());
    }

    @GetMapping("/dashboard-stats")
    public Mono<DashboardStatsDTO> getDashboardStats() {
        return adminUseCase.getDashboardStats();
    }
}
