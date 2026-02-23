package com.polytechnique.tiibntick.services;

import com.polytechnique.tiibntick.dtos.address.AddressDTO;
import com.polytechnique.tiibntick.dtos.announcement.AnnouncementRequestDTO;
import com.polytechnique.tiibntick.dtos.announcement.AnnouncementResponseDTO;
import com.polytechnique.tiibntick.dtos.packet.PacketDTO;
import com.polytechnique.tiibntick.dtos.subscription.SubscriptionResponseDTO;
import com.polytechnique.tiibntick.models.Address;
import com.polytechnique.tiibntick.models.Announcement;
import com.polytechnique.tiibntick.models.Packet;
import com.polytechnique.tiibntick.models.enums.announcement.AnnouncementStatus;
import com.polytechnique.tiibntick.repositories.AddressRepository;
import com.polytechnique.tiibntick.repositories.AnnouncementRepository;
import com.polytechnique.tiibntick.repositories.AnnouncementSubscriptionRepository;
import com.polytechnique.tiibntick.repositories.DeliveryPersonRepository;
import com.polytechnique.tiibntick.repositories.PersonRepository;
import com.polytechnique.tiibntick.events.AnnouncementPublishedEvent;
import com.polytechnique.tiibntick.repositories.PacketRepository;
import com.polytechnique.tiibntick.services.support.KafkaEventPublisher;
import com.polytechnique.tiibntick.services.support.FileStorageService;
import com.polytechnique.tiibntick.services.support.EmailService;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AddressRepository addressRepository;
    private final PacketRepository packetRepository;
    private final KafkaEventPublisher kafkaEventPublisher;
    private final FileStorageService fileStorageService;
    private final org.springframework.data.r2dbc.core.R2dbcEntityTemplate entityTemplate;
    private final AnnouncementSubscriptionRepository subscriptionRepository;
    private final DeliveryPersonRepository deliveryPersonRepository;
    private final PersonRepository personRepository;
    private final EmailService emailService;

    @Transactional("connectionFactoryTransactionManager")
    public Mono<AnnouncementResponseDTO> createAnnouncement(AnnouncementRequestDTO request) {
        // 1. Prepare Addresses: Find existing or Create new
        return findOrCreateAddress(request.getPickupAddress()).flatMap(savedPickup -> {

            return findOrCreateAddress(request.getDeliveryAddress()).flatMap(savedDelivery -> {

                // 3. Prepare Packet first (must exist before announcement due to FK constraint)
                UUID packetId = UUID.randomUUID();
                Packet packet = new Packet();
                packet.setId(packetId);
                packet.setWeight(request.getPacket().getWeight());
                packet.setWidth(request.getPacket().getWidth());
                packet.setHeight(request.getPacket().getHeight());
                packet.setLength(request.getPacket().getLength());
                packet.setFragile(request.getPacket().getFragile());
                packet.setDescription(request.getPacket().getDescription());
                packet.setIsPerishable(request.getPacket().getIsPerishable());
                packet.setThickness(request.getPacket().getThickness());
                packet.setDesignation(request.getPacket().getDesignation());

                String inputPhoto = request.getPacket().getPhotoPacket();
                return fileStorageService.saveBase64Image(inputPhoto, "packet")
                        .defaultIfEmpty(inputPhoto != null ? inputPhoto : "")
                        .flatMap(path -> {
                            packet.setPhotoPacket(path);

                            // Save Packet FIRST (FK constraint requires it to exist before announcement)
                            return entityTemplate.insert(packet).flatMap(savedPacket -> {

                                // 4. Now prepare and save Announcement with the existing packet_id
                                Announcement announcement = new Announcement();
                                announcement.setId(UUID.randomUUID());
                                announcement.setClientId(request.getClientId());
                                announcement.setPacketId(savedPacket.getId());
                                announcement.setPickupAddressId(savedPickup.getId());
                                announcement.setDeliveryAddressId(savedDelivery.getId());
                                announcement.setTitle(request.getTitle());
                                announcement.setDescription(request.getDescription());

                                boolean shouldAutoPublish = Boolean.TRUE.equals(request.getAutoPublish());
                                announcement.setStatus(
                                        shouldAutoPublish ? AnnouncementStatus.PUBLISHED : AnnouncementStatus.DRAFT);

                                announcement.setCreatedAt(Instant.now());
                                announcement.setRecipientFirstName(request.getRecipientFirstName());
                                announcement.setRecipientLastName(request.getRecipientLastName());
                                announcement.setRecipientEmail(request.getRecipientEmail());
                                announcement.setRecipientPhone(request.getRecipientPhone());
                                announcement.setShipperFirstName(request.getShipperFirstName());
                                announcement.setShipperLastName(request.getShipperLastName());
                                announcement.setShipperEmail(request.getShipperEmail());
                                announcement.setShipperPhone(request.getShipperPhone());
                                announcement.setAmount(request.getAmount());
                                announcement.setSignatureUrl(request.getSignatureUrl());
                                announcement.setPaymentMethod(request.getPaymentMethod());
                                announcement.setTransportMethod(request.getTransportMethod());
                                announcement.setDistance(request.getDistance());
                                announcement.setDuration(request.getDuration());

                                // Use template.insert() to FORCE INSERT with the manual ID
                                return entityTemplate.insert(announcement).map(savedAnnouncement -> {

                                    // Handle Auto-Publish Event
                                    if (shouldAutoPublish) {
                                        AnnouncementResponseDTO responseDTO = mapToResponse(savedAnnouncement,
                                                savedPickup, savedDelivery, savedPacket);

                                        AnnouncementPublishedEvent event = new AnnouncementPublishedEvent();
                                        event.setAnnouncement(responseDTO);
                                        kafkaEventPublisher.publishAnnouncementPublished(event);

                                        return responseDTO;
                                    }

                                    return mapToResponse(savedAnnouncement, savedPickup, savedDelivery,
                                            savedPacket);
                                });
                            });
                        });
            });
        });
    }

    private Mono<Address> findOrCreateAddress(AddressDTO dto) {
        return addressRepository.findFirstByStreetIgnoreCaseAndCityIgnoreCaseAndDistrictIgnoreCaseAndCountryIgnoreCase(
                dto.getStreet(), dto.getCity(), dto.getDistrict(), dto.getCountry())
                .switchIfEmpty(Mono.defer(() -> {
                    Address address = maptoAddress(dto);
                    address.setId(UUID.randomUUID());
                    // Use template.insert() to FORCE INSERT with the manual ID
                    return entityTemplate.insert(address);
                }));
    }

    public Flux<AnnouncementResponseDTO> getAllAnnouncements() {
        return announcementRepository.findAll().flatMap(this::populateDetails);
    }

    public Flux<AnnouncementResponseDTO> getAnnouncementsByClientId(UUID clientId) {
        return announcementRepository.findAllByClientId(clientId).flatMap(this::populateDetails);
    }

    public Mono<AnnouncementResponseDTO> getAnnouncement(UUID id) {
        return announcementRepository.findById(id).flatMap(this::populateDetails);
    }

    @Transactional("connectionFactoryTransactionManager")
    public Mono<Void> deleteAnnouncement(UUID id) {
        return announcementRepository.findById(id)
                .flatMap(announcement -> {
                    Mono<Void> deletePacket = announcement.getPacketId() != null
                            ? packetRepository.findById(announcement.getPacketId())
                                    .flatMap(packet -> {
                                        Mono<Void> deletePhoto = packet.getPhotoPacket() != null
                                                && !packet.getPhotoPacket().isEmpty()
                                                        ? fileStorageService.deleteFile(packet.getPhotoPacket()).then()
                                                        : Mono.empty();
                                        return deletePhoto
                                                .then(packetRepository.deleteById(announcement.getPacketId()));
                                    })
                            : Mono.empty();

                    Mono<Void> deleteSignature = announcement.getSignatureUrl() != null
                            && !announcement.getSignatureUrl().isEmpty()
                                    ? fileStorageService.deleteFile(announcement.getSignatureUrl()).then()
                                    : Mono.empty();

                    // Delete Announcement FIRST to satisfy FK constraint (Announcement -> Packet)
                    return announcementRepository.delete(announcement)
                            .then(deletePacket)
                            .then(deleteSignature);
                });
    }

    private Mono<AnnouncementResponseDTO> populateDetails(Announcement announcement) {
        Mono<Address> pickupMono = addressRepository.findById(announcement.getPickupAddressId());
        Mono<Address> deliveryMono = addressRepository.findById(announcement.getDeliveryAddressId());
        Mono<Packet> packetMono = announcement.getPacketId() != null
                ? packetRepository.findById(announcement.getPacketId())
                : Mono.just(new Packet());

        return Mono.zip(pickupMono, deliveryMono, packetMono)
                .map(tuple -> mapToResponse(announcement, tuple.getT1(), tuple.getT2(), tuple.getT3()))
                .flatMap(response -> {
                    // Populate assigned delivery person info if present
                    if (announcement.getAssignedDeliveryPersonId() != null) {
                        return deliveryPersonRepository.findById(announcement.getAssignedDeliveryPersonId())
                                .flatMap(dp -> personRepository.findById(dp.getPersonId()))
                                .map(person -> {
                                    response.setAssignedDeliveryPersonId(announcement.getAssignedDeliveryPersonId());
                                    response.setAssignedDeliveryPersonFirstName(person.getFirstName());
                                    response.setAssignedDeliveryPersonLastName(person.getLastName());
                                    response.setAssignedDeliveryPersonEmail(person.getEmail());
                                    response.setAssignedDeliveryPersonPhone(person.getPhone());
                                    return response;
                                })
                                .defaultIfEmpty(response);
                    }
                    return Mono.just(response);
                });
    }

    private Address maptoAddress(AddressDTO dto) {
        Address address = new Address();
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setDistrict(dto.getDistrict());
        address.setCountry(dto.getCountry());
        address.setDescription(dto.getDescription());
        address.setType(dto.getType());
        address.setLatitude(dto.getLatitude());
        address.setLongitude(dto.getLongitude());
        return address;
    }

    private AnnouncementResponseDTO mapToResponse(Announcement announcement, Address pickup, Address delivery,
            Packet packet) {
        AnnouncementResponseDTO response = new AnnouncementResponseDTO();
        response.setId(announcement.getId());
        response.setClientId(announcement.getClientId());
        response.setTitle(announcement.getTitle());
        response.setDescription(announcement.getDescription());
        response.setStatus(announcement.getStatus());
        response.setCreatedAt(announcement.getCreatedAt());
        response.setUpdatedAt(announcement.getUpdatedAt());
        response.setRecipientFirstName(announcement.getRecipientFirstName());
        response.setRecipientLastName(announcement.getRecipientLastName());
        response.setRecipientEmail(announcement.getRecipientEmail());
        response.setRecipientPhone(announcement.getRecipientPhone());
        response.setShipperFirstName(announcement.getShipperFirstName());
        response.setShipperLastName(announcement.getShipperLastName());
        response.setShipperEmail(announcement.getShipperEmail());
        response.setShipperPhone(announcement.getShipperPhone());
        response.setAmount(announcement.getAmount());
        response.setSignatureUrl(announcement.getSignatureUrl());
        response.setPaymentMethod(announcement.getPaymentMethod());
        response.setTransportMethod(announcement.getTransportMethod());
        response.setDistance(announcement.getDistance());
        response.setDuration(announcement.getDuration());

        response.setPickupAddress(mapToAddressDTO(pickup));
        response.setDeliveryAddress(mapToAddressDTO(delivery));
        response.setPacket(mapToPacketDTO(packet));

        return response;
    }

    private AddressDTO mapToAddressDTO(Address address) {
        if (address == null)
            return null;
        AddressDTO dto = new AddressDTO();
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setDistrict(address.getDistrict());
        dto.setCountry(address.getCountry());
        dto.setDescription(address.getDescription());
        dto.setType(address.getType());
        dto.setLatitude(address.getLatitude());
        dto.setLongitude(address.getLongitude());
        return dto;
    }

    private PacketDTO mapToPacketDTO(Packet packet) {
        if (packet == null)
            return null;
        PacketDTO dto = new PacketDTO();
        dto.setWeight(packet.getWeight());
        dto.setWidth(packet.getWidth());
        dto.setHeight(packet.getHeight());
        dto.setLength(packet.getLength());
        dto.setFragile(packet.getFragile());
        dto.setDescription(packet.getDescription());
        dto.setPhotoPacket(packet.getPhotoPacket());
        dto.setIsPerishable(packet.getIsPerishable());
        dto.setThickness(packet.getThickness());
        dto.setDesignation(packet.getDesignation());
        return dto;
    }

    @Transactional("connectionFactoryTransactionManager")
    public Mono<AnnouncementResponseDTO> updateAnnouncement(UUID id, AnnouncementRequestDTO request) {
        return announcementRepository.findById(id)
                .flatMap(announcement -> {
                    // Block updates on assigned announcements
                    if (announcement.getStatus() == AnnouncementStatus.ASSIGNED) {
                        return Mono.error(new RuntimeException("Cannot modify an assigned announcement"));
                    }
                    announcement.setTitle(request.getTitle());
                    announcement.setDescription(request.getDescription());
                    announcement.setTitle(request.getTitle());
                    announcement.setDescription(request.getDescription());
                    announcement.setRecipientFirstName(request.getRecipientFirstName());
                    announcement.setRecipientLastName(request.getRecipientLastName());
                    announcement.setRecipientEmail(request.getRecipientEmail());
                    announcement.setRecipientPhone(request.getRecipientPhone());
                    announcement.setShipperFirstName(request.getShipperFirstName());
                    announcement.setShipperLastName(request.getShipperLastName());
                    announcement.setShipperEmail(request.getShipperEmail());
                    announcement.setShipperPhone(request.getShipperPhone());
                    announcement.setAmount(request.getAmount());
                    announcement.setSignatureUrl(request.getSignatureUrl());
                    announcement.setPaymentMethod(request.getPaymentMethod());
                    announcement.setTransportMethod(request.getTransportMethod());
                    announcement.setDistance(request.getDistance());
                    announcement.setDuration(request.getDuration());
                    announcement.setUpdatedAt(Instant.now());

                    return announcementRepository.save(announcement).flatMap(savedAnnouncement -> {
                        Mono<Packet> packetUpdate = Mono.just(new Packet());
                        if (savedAnnouncement.getPacketId() != null) {
                            packetUpdate = packetRepository.findById(savedAnnouncement.getPacketId())
                                    .flatMap(packet -> {
                                        if (request.getPacket() != null) {
                                            packet.setWeight(request.getPacket().getWeight());
                                            packet.setWidth(request.getPacket().getWidth());
                                            packet.setHeight(request.getPacket().getHeight());
                                            packet.setLength(request.getPacket().getLength());
                                            packet.setFragile(request.getPacket().getFragile());
                                            packet.setDescription(request.getPacket().getDescription());
                                            packet.setIsPerishable(request.getPacket().getIsPerishable());
                                            packet.setThickness(request.getPacket().getThickness());
                                            packet.setDesignation(request.getPacket().getDesignation());

                                            String inputPhoto = request.getPacket().getPhotoPacket();
                                            return fileStorageService.saveBase64Image(inputPhoto, "packet")
                                                    .defaultIfEmpty(inputPhoto != null ? inputPhoto : "")
                                                    .flatMap(path -> {
                                                        packet.setPhotoPacket(path);
                                                        return packetRepository.save(packet);
                                                    });
                                        }
                                        return Mono.just(packet);
                                    });
                        }

                        Mono<Address> pickupUpdate = addressRepository.findById(savedAnnouncement.getPickupAddressId())
                                .flatMap(address -> {
                                    if (request.getPickupAddress() != null) {
                                        updateAddressFromDTO(address, request.getPickupAddress());
                                        return addressRepository.save(address);
                                    }
                                    return Mono.just(address);
                                });

                        Mono<Address> deliveryUpdate = addressRepository
                                .findById(savedAnnouncement.getDeliveryAddressId())
                                .flatMap(address -> {
                                    if (request.getDeliveryAddress() != null) {
                                        updateAddressFromDTO(address, request.getDeliveryAddress());
                                        return addressRepository.save(address);
                                    }
                                    return Mono.just(address);
                                });

                        return Mono.zip(packetUpdate, pickupUpdate, deliveryUpdate)
                                .map(tuple -> mapToResponse(savedAnnouncement, tuple.getT2(), tuple.getT3(),
                                        tuple.getT1()));
                    });
                });
    }

    private void updateAddressFromDTO(Address address, AddressDTO dto) {
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setDistrict(dto.getDistrict());
        address.setCountry(dto.getCountry());
        address.setDescription(dto.getDescription());
        address.setType(dto.getType());
        address.setLatitude(dto.getLatitude());
        address.setLongitude(dto.getLongitude());
    }

    @Transactional("connectionFactoryTransactionManager")
    public Mono<AnnouncementResponseDTO> publishAnnouncement(UUID id) {
        return announcementRepository.findById(id)
                .flatMap(announcement -> {
                    announcement.setStatus(AnnouncementStatus.PUBLISHED);
                    return announcementRepository.save(announcement)
                            .flatMap(this::populateDetails)
                            .doOnSuccess(dto -> {
                                AnnouncementPublishedEvent event = new AnnouncementPublishedEvent();
                                event.setAnnouncement(dto);
                                kafkaEventPublisher.publishAnnouncementPublished(event);
                            });
                });
    }

    public Mono<Void> initiateSubscription(UUID announcementId, UUID deliveryPersonId) {
        return Mono.fromRunnable(() -> {
            com.polytechnique.tiibntick.events.SubscriptionAttemptEvent event = new com.polytechnique.tiibntick.events.SubscriptionAttemptEvent(
                    announcementId,
                    deliveryPersonId,
                    Instant.now());
            kafkaEventPublisher.publishSubscriptionAttempt(event);
        });
    }

    /**
     * Returns subscribed delivery persons for a given announcement.
     */
    public Flux<SubscriptionResponseDTO> getSubscriptionsForAnnouncement(UUID announcementId) {
        return subscriptionRepository.findAllByAnnouncementId(announcementId)
                .flatMap(sub -> deliveryPersonRepository.findById(sub.getDeliveryPersonId())
                        .flatMap(dp -> personRepository.findById(dp.getPersonId())
                                .map(person -> {
                                    SubscriptionResponseDTO dto = new SubscriptionResponseDTO();
                                    dto.setSubscriptionId(sub.getId());
                                    dto.setDeliveryPersonId(dp.getId());
                                    dto.setFirstName(person.getFirstName());
                                    dto.setLastName(person.getLastName());
                                    dto.setEmail(person.getEmail());
                                    dto.setPhone(person.getPhone());
                                    dto.setRating(person.getRating());
                                    dto.setStatus(sub.getStatus());
                                    dto.setCreatedAt(sub.getCreatedAt());
                                    return dto;
                                })));
    }

    /**
     * Assigns a delivery person to an announcement, updates status to ASSIGNED,
     * and sends an email notification.
     */
    @Transactional
    public Mono<AnnouncementResponseDTO> assignDeliveryPerson(UUID announcementId, UUID deliveryPersonId) {
        return announcementRepository.findById(announcementId)
                .switchIfEmpty(Mono.error(new RuntimeException("Announcement not found")))
                .flatMap(announcement -> {
                    announcement.setStatus(AnnouncementStatus.ASSIGNED);
                    announcement.setAssignedDeliveryPersonId(deliveryPersonId);
                    announcement.setUpdatedAt(Instant.now());
                    return announcementRepository.save(announcement);
                })
                .flatMap(this::populateDetails)
                .doOnSuccess(response -> {
                    // Send email notification to the assigned delivery person (fire-and-forget)
                    deliveryPersonRepository.findById(deliveryPersonId)
                            .flatMap(dp -> personRepository.findById(dp.getPersonId()))
                            .doOnSuccess(person -> {
                                if (person != null && person.getEmail() != null) {
                                    emailService.sendDeliveryAssigned(person.getEmail(), response.getTitle());
                                }
                            })
                            .subscribe();
                });
    }

    /**
     * Returns announcements that a delivery person has subscribed to.
     */
    public Flux<AnnouncementResponseDTO> getSubscriptionsByDeliveryPersonId(UUID deliveryPersonId) {
        return subscriptionRepository.findAllByDeliveryPersonId(deliveryPersonId)
                .flatMap(sub -> announcementRepository.findById(sub.getAnnouncementId())
                        .flatMap(this::populateDetails));
    }
}
