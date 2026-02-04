package com.polytechnique.ticbnpick.services;

import com.polytechnique.ticbnpick.dtos.announcement.AnnouncementRequestDTO;
import com.polytechnique.ticbnpick.dtos.announcement.AnnouncementResponseDTO;
import com.polytechnique.ticbnpick.dtos.packet.PacketDTO;
import com.polytechnique.ticbnpick.dtos.address.AddressDTO;
import com.polytechnique.ticbnpick.models.Address;
import com.polytechnique.ticbnpick.models.Announcement;
import com.polytechnique.ticbnpick.models.Packet;
import com.polytechnique.ticbnpick.models.enums.announcement.AnnouncementStatus;
import com.polytechnique.ticbnpick.repositories.AddressRepository;
import com.polytechnique.ticbnpick.repositories.AnnouncementRepository;
import com.polytechnique.ticbnpick.repositories.PacketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Tests for AnnouncementService.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 *       Note: Validated service methods including new publication logic.
 */
@ExtendWith(MockitoExtension.class)
class AnnouncementServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private PacketRepository packetRepository;

    @InjectMocks
    private AnnouncementService announcementService;

    @Test
    void createAnnouncement_ShouldReturnResponse() {
        AnnouncementRequestDTO request = new AnnouncementRequestDTO();
        request.setClientId(UUID.randomUUID());
        request.setTitle("Test Announcement");
        request.setPacket(new PacketDTO());
        request.setPickupAddress(new AddressDTO());
        request.setDeliveryAddress(new AddressDTO());

        Packet savedPacket = new Packet();
        savedPacket.setId(UUID.randomUUID());

        Address savedAddress = new Address();
        savedAddress.setId(UUID.randomUUID());

        Announcement savedAnnouncement = new Announcement();
        savedAnnouncement.setId(UUID.randomUUID());
        savedAnnouncement.setTitle("Test Announcement");
        savedAnnouncement.setStatus(AnnouncementStatus.PUBLISHED);

        when(packetRepository.save(any(Packet.class))).thenReturn(Mono.just(savedPacket));
        when(addressRepository.save(any(Address.class))).thenReturn(Mono.just(savedAddress));
        when(announcementRepository.save(any(Announcement.class))).thenReturn(Mono.just(savedAnnouncement));

        StepVerifier.create(announcementService.createAnnouncement(request))
                .expectNextMatches(response -> response.getId().equals(savedAnnouncement.getId()) &&
                        response.getTitle().equals("Test Announcement"))
                .verifyComplete();
    }

    @Test
    void getAllAnnouncements_ShouldReturnFlux() {
        UUID packetId = UUID.randomUUID();
        UUID addrId = UUID.randomUUID();

        Announcement announcement = new Announcement();
        announcement.setId(UUID.randomUUID());
        announcement.setPacketId(packetId);
        announcement.setPickupAddressId(addrId);
        announcement.setDeliveryAddressId(addrId);

        when(announcementRepository.findAll()).thenReturn(Flux.just(announcement));
        when(packetRepository.findById(packetId)).thenReturn(Mono.just(new Packet()));
        when(addressRepository.findById(addrId)).thenReturn(Mono.just(new Address()));

        StepVerifier.create(announcementService.getAllAnnouncements())
                .expectNextCount(1)
                .verifyComplete();
    }
}
