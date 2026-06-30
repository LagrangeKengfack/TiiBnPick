package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.application.service.person.LecturePersonService;
import com.polytechnique.tiibntick.application.service.person.ModificationPersonService;
import com.polytechnique.tiibntick.application.service.support.PasswordHasherService;
import com.polytechnique.tiibntick.application.service.support.TokenService;
import com.polytechnique.tiibntick.application.validator.SetPasswordValidator;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.SetPasswordRequest;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class PasswordSetupServiceTest {

    @Mock
    private TokenService tokenService;

    @Mock
    private LecturePersonService lecturePersonService;

    @Mock
    private ModificationPersonService modificationPersonService;

    @Mock
    private PasswordHasherService passwordHasherService;

    @Mock
    private SetPasswordValidator validator;

    @InjectMocks
    private PasswordSetupService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
