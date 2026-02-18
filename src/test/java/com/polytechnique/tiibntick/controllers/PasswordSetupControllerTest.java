package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.dtos.requests.SetPasswordRequest;
import com.polytechnique.tiibntick.services.PasswordSetupService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf;

@WebFluxTest(controllers = PasswordSetupController.class)
class PasswordSetupControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private PasswordSetupService passwordSetupService;

    @Test
    @WithMockUser
    void setPassword_Success() {
        SetPasswordRequest request = new SetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("new-password");

        when(passwordSetupService.setPassword(any(SetPasswordRequest.class))).thenReturn(Mono.empty());

        webTestClient.mutateWith(csrf())
                .post().uri("/api/auth/setup-password")
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk();
    }
}
