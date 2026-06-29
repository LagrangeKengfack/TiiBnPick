package com.polytechnique.tiibntick.domain.port.in;

import com.polytechnique.tiibntick.infrastructure.web.dto.admin.DashboardStatsDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.auth.AuthResponseDTO;
import reactor.core.publisher.Mono;

/**
 * Inbound port for admin management use cases.
 */
public interface AdminUseCase {

    Mono<AuthResponseDTO> getCurrentAdmin(String email);

    Mono<DashboardStatsDTO> getDashboardStats();
}
