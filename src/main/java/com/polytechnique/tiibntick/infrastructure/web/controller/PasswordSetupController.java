package com.polytechnique.tiibntick.infrastructure.web.controller;

import com.polytechnique.tiibntick.infrastructure.web.dto.requests.SetPasswordRequest;
import com.polytechnique.tiibntick.application.service.PasswordSetupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

/**
 * Inbound REST adapter for password setup.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordSetupController {

    private final PasswordSetupService passwordSetupService;

    @PostMapping("/setup-password")
    public Mono<ResponseEntity<Void>> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        return passwordSetupService.setPassword(request)
                .map(v -> ResponseEntity.ok().<Void>build());
    }
}
