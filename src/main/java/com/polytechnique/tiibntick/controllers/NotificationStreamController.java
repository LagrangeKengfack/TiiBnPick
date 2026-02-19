package com.polytechnique.tiibntick.controllers;

import com.polytechnique.tiibntick.events.MatchingNotificationEvent;
import com.polytechnique.tiibntick.services.support.NotificationStreamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.UUID;

/**
 * Controller exposing real-time notification streams via SSE.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationStreamController {

    private final NotificationStreamService notificationStreamService;

    @GetMapping(value = "/stream/{deliveryPersonId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<MatchingNotificationEvent> getNotificationStream(@PathVariable UUID deliveryPersonId) {
        return notificationStreamService.getNotificationStream(deliveryPersonId);
    }
}
