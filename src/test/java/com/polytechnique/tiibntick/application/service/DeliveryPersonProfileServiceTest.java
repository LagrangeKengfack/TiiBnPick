package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.model.Address;
import com.polytechnique.tiibntick.domain.model.DeliveryPerson;
import com.polytechnique.tiibntick.domain.model.Logistics;
import com.polytechnique.tiibntick.domain.model.Person;
import com.polytechnique.tiibntick.domain.model.PersonAddress;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.AddressRepository;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.PersonAddressRepository;
import com.polytechnique.tiibntick.application.service.address.CreationAddressService;
import com.polytechnique.tiibntick.application.service.address.ModificationAddressService;
import com.polytechnique.tiibntick.application.service.deliveryperson.LectureDeliveryPersonService;
import com.polytechnique.tiibntick.application.service.deliveryperson.ModificationDeliveryPersonService;
import com.polytechnique.tiibntick.application.service.deliveryperson.SuppressionDeliveryPersonService;
import com.polytechnique.tiibntick.application.service.logistics.LectureLogisticsService;
import com.polytechnique.tiibntick.application.service.logistics.ModificationLogisticsService;
import com.polytechnique.tiibntick.application.service.logistics.SuppressionLogisticsService;
import com.polytechnique.tiibntick.application.service.person.LecturePersonService;
import com.polytechnique.tiibntick.application.service.person.ModificationPersonService;
import com.polytechnique.tiibntick.application.service.person.SuppressionPersonService;
import com.polytechnique.tiibntick.infrastructure.web.dto.requests.DeliveryPersonUpdateRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for DeliveryPersonProfileService based on Hexagonal Architecture.
 */
@ExtendWith(MockitoExtension.class)
class DeliveryPersonProfileServiceTest {

    @Mock
    private LectureDeliveryPersonService lectureDeliveryPersonService;
    @Mock
    private ModificationDeliveryPersonService modificationDeliveryPersonService;
    @Mock
    private LectureLogisticsService lectureLogisticsService;
    @Mock
    private ModificationLogisticsService modificationLogisticsService;
    @Mock
    private LecturePersonService lecturePersonService;
    @Mock
    private PersonAddressRepository personAddressRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private CreationAddressService creationAddressService;
    @Mock
    private ModificationAddressService modificationAddressService;

    @Mock
    private ModificationPersonService modificationPersonService;
    @Mock
    private SuppressionDeliveryPersonService suppressionDeliveryPersonService;
    @Mock
    private SuppressionPersonService suppressionPersonService;
    @Mock
    private SuppressionLogisticsService suppressionLogisticsService;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DeliveryPersonProfileService service;

    @Test
    void updateProfile_AllFields_ShouldUpdateDirectly() {
        // Arrange
        UUID dpId = UUID.randomUUID();
        DeliveryPersonUpdateRequest request = new DeliveryPersonUpdateRequest();
        request.setCommercialRegister("NEW_REG");
        request.setPhone("123456");
        request.setCommercialName("New Name");
        request.setPlateNumber("XYZ123");
        // Address fields
        request.setCity("Paris");

        DeliveryPerson dp = new DeliveryPerson();
        dp.setId(dpId);
        dp.setPersonId(UUID.randomUUID());

        Person person = new Person();
        Logistics logistics = new Logistics();

        // Address mocking
        PersonAddress personAddress = new PersonAddress();
        personAddress.setPersonId(dp.getPersonId());
        personAddress.setAddressId(UUID.randomUUID());
        Address address = new Address();
        address.setId(personAddress.getAddressId());

        when(lectureDeliveryPersonService.findById(dpId)).thenReturn(Mono.just(dp));
        when(lecturePersonService.findById(dp.getPersonId())).thenReturn(Mono.just(person));
        when(modificationPersonService.updatePerson(any())).thenReturn(Mono.just(person));
        when(modificationDeliveryPersonService.updateDeliveryPerson(any())).thenReturn(Mono.just(dp));
        when(lectureLogisticsService.findByDeliveryPersonId(dpId)).thenReturn(Mono.just(logistics));
        when(modificationLogisticsService.updateLogistics(any())).thenReturn(Mono.just(logistics));

        when(personAddressRepository.findByPersonId(dp.getPersonId())).thenReturn(Flux.just(personAddress));
        when(addressRepository.findById(personAddress.getAddressId())).thenReturn(Mono.just(address));
        when(modificationAddressService.updateAddress(any())).thenReturn(Mono.just(address));

        // Act & Assert
        StepVerifier.create(service.updateProfile(dpId, request))
                .verifyComplete();

        // Verify direct updates (no pending workflow)
        verify(modificationPersonService).updatePerson(any());
        verify(modificationDeliveryPersonService).updateDeliveryPerson(any());
        verify(modificationLogisticsService).updateLogistics(any());
        verify(modificationAddressService).updateAddress(any());
    }

    @Test
    void updateProfile_OnlyPersonFields_ShouldUpdatePerson() {
        // Arrange
        UUID dpId = UUID.randomUUID();
        DeliveryPersonUpdateRequest request = new DeliveryPersonUpdateRequest();
        request.setPhone("123456");

        DeliveryPerson dp = new DeliveryPerson();
        dp.setId(dpId);
        dp.setPersonId(UUID.randomUUID());

        Person person = new Person();

        when(lectureDeliveryPersonService.findById(dpId)).thenReturn(Mono.just(dp));
        when(lecturePersonService.findById(dp.getPersonId())).thenReturn(Mono.just(person));
        when(modificationPersonService.updatePerson(any())).thenReturn(Mono.just(person));
        when(lectureLogisticsService.findByDeliveryPersonId(dpId)).thenReturn(Mono.empty());
        // Address update skipped if no fields

        // Act & Assert
        StepVerifier.create(service.updateProfile(dpId, request))
                .verifyComplete();

        verify(modificationPersonService).updatePerson(any());
        verify(modificationDeliveryPersonService, never()).updateDeliveryPerson(any());
        verify(modificationLogisticsService, never()).updateLogistics(any());
        verify(modificationAddressService, never()).updateAddress(any());
    }

    @Test
    void updateProfile_OnlyDeliveryPersonFields_ShouldUpdateDeliveryPerson() {
        // Arrange
        UUID dpId = UUID.randomUUID();
        DeliveryPersonUpdateRequest request = new DeliveryPersonUpdateRequest();
        request.setCommercialName("Updated Name");
        request.setCommercialRegister("UPDATED_REG");

        DeliveryPerson dp = new DeliveryPerson();
        dp.setId(dpId);
        dp.setPersonId(UUID.randomUUID());

        Person person = new Person();

        when(lectureDeliveryPersonService.findById(dpId)).thenReturn(Mono.just(dp));
        when(lecturePersonService.findById(dp.getPersonId())).thenReturn(Mono.just(person));
        when(modificationDeliveryPersonService.updateDeliveryPerson(any())).thenReturn(Mono.just(dp));
        when(lectureLogisticsService.findByDeliveryPersonId(dpId)).thenReturn(Mono.empty());

        // Act & Assert
        StepVerifier.create(service.updateProfile(dpId, request))
                .verifyComplete();

        verify(modificationDeliveryPersonService).updateDeliveryPerson(any());
        verify(modificationPersonService, never()).updatePerson(any());
        verify(modificationAddressService, never()).updateAddress(any());
    }

    @Test
    void deleteProfile_ShouldDeleteInCascade() {
        // Arrange
        UUID dpId = UUID.randomUUID();
        UUID personId = UUID.randomUUID();
        DeliveryPerson dp = new DeliveryPerson();
        dp.setId(dpId);
        dp.setPersonId(personId);

        when(lectureDeliveryPersonService.findById(dpId)).thenReturn(Mono.just(dp));
        when(suppressionLogisticsService.deleteByDeliveryPersonId(dpId)).thenReturn(Mono.empty());
        when(suppressionDeliveryPersonService.deleteById(dpId)).thenReturn(Mono.empty());
        when(suppressionPersonService.deleteById(personId)).thenReturn(Mono.empty());

        // Act & Assert
        StepVerifier.create(service.deleteProfile(dpId))
                .verifyComplete();

        verify(suppressionLogisticsService).deleteByDeliveryPersonId(dpId);
        verify(suppressionDeliveryPersonService).deleteById(dpId);
        verify(suppressionPersonService).deleteById(personId);
    }
}
