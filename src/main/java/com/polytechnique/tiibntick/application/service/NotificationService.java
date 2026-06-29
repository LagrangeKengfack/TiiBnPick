package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.infrastructure.search.AnnouncementDocument;
import com.polytechnique.tiibntick.infrastructure.search.DeliveryPersonDocument;
import com.polytechnique.tiibntick.domain.model.Notification;
import com.polytechnique.tiibntick.domain.model.enums.notification.NotificationStatus;
import com.polytechnique.tiibntick.domain.model.enums.notification.NotificationType;
import com.polytechnique.tiibntick.infrastructure.persistence.repository.NotificationRepository;
import com.polytechnique.tiibntick.application.service.support.EmailService;
import com.polytechnique.tiibntick.application.service.support.PushNotificationService;
import com.polytechnique.tiibntick.application.service.support.KafkaEventPublisher;
import com.polytechnique.tiibntick.infrastructure.kafka.event.MatchingNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Service responsible for managing and sending notifications.
 * Orchestrates Email, Push, and DB persistence.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final PushNotificationService pushNotificationService;
    private final KafkaEventPublisher kafkaEventPublisher;

    /**
     * Notifies eligible delivery persons about a new announcement match.
     *
     * @param deliveryPersons List of eligible delivery persons.
     * @param announcement    The matched announcement.
     * @return A Flux of saved Notifications.
     */
    @Transactional("connectionFactoryTransactionManager")
    public Flux<Notification> notifyEligibleDeliveryPersons(List<DeliveryPersonDocument> deliveryPersons,
            AnnouncementDocument announcement) {
        log.info("Notifying {} delivery persons for Announcement {}", deliveryPersons.size(), announcement.getId());

        return Flux.fromIterable(deliveryPersons)
                .flatMap(dp -> sendNotification(dp, announcement));
    }

    private Mono<Notification> sendNotification(DeliveryPersonDocument dp, AnnouncementDocument announcement) {
        String title = "Nouvelle course disponible !";
        String message = "Une course correspond à votre position. Cliquez pour voir les détails.";

        // 1. Create Notification Entity
        Notification notification = new Notification();
        notification.setPersonId(dp.getPersonId());
        notification.setNotificationType(NotificationType.NEW_ANNOUNCEMENT);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationStatus(NotificationStatus.SENT);

        // 2. Persist to DB
        return notificationRepository.save(notification)
                .flatMap(savedNotification -> {
                    // 3. Send Email
                    Mono<Void> emailMono = emailService.sendSimpleMessageReactive(
                            dp.getEmail(),
                            title,
                            message + "\n\nAnnonce ID: " + announcement.getId()).onErrorResume(e -> {
                                log.error("Error sending email to {}: {}", dp.getEmail(), e.getMessage());
                                return Mono.empty();
                            });

                    // 4. Send Push Notification
                    Mono<Void> pushMono = pushNotificationService.sendPushNotification(
                            dp.getId(),
                            title,
                            message).onErrorResume(e -> {
                                return Mono.empty();
                            });

                    // 5. Send Kafka Notification
                    MatchingNotificationEvent kafkaEvent = MatchingNotificationEvent.builder()
                            .deliveryPersonId(dp.getId())
                            .announcementId(announcement.getId())
                            .title(title)
                            .message(message)
                            .build();

                    try {
                        kafkaEventPublisher.publishMatchingNotification(kafkaEvent);
                    } catch (Exception e) {
                        log.error("Error sending Kafka notification for delivery person {}: {}", dp.getId(),
                                e.getMessage());
                    }

                    // execute side effects without blocking the return of the saved notification
                    return Mono.when(emailMono, pushMono)
                            .thenReturn(savedNotification);
                });
    }
}
