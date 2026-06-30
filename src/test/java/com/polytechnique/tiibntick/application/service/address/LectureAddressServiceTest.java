package com.polytechnique.tiibntick.application.service.address;

import com.polytechnique.tiibntick.domain.model.Address;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.AddressRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class LectureAddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @InjectMocks
    private LectureAddressService service;

    @Test
    void contextLoads() {
        assertThat(service).isNotNull();
    }
}
