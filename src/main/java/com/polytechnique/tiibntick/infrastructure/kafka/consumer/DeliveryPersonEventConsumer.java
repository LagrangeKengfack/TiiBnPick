package com.polytechnique.tiibntick.infrastructure.kafka.consumer;

import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonCreatedEvent;
import com.polytechnique.tiibntick.infrastructure.kafka.event.DeliveryPersonValidatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Inbound Kafka adapter: consumes delivery person lifecycle events.
 * Logs events for monitoring and debugging purposes.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
@Slf4j
@Component
public class DeliveryPersonEventConsumer {

    @KafkaListener(topics = "delivery-person-created", groupId = "tiibntick-group")
    public void handleDeliveryPersonCreated(DeliveryPersonCreatedEvent event) {
        log.info("Received DeliveryPersonCreatedEvent: deliveryPersonId={}, email={}",
                event.getDeliveryPersonId(), event.getEmail());
    }

    @KafkaListener(topics = "delivery-person-validated", groupId = "tiibntick-group")
    public void handleDeliveryPersonValidated(DeliveryPersonValidatedEvent event) {
        log.info("Received DeliveryPersonValidatedEvent: deliveryPersonId={}, approved={}",
                event.getDeliveryPersonId(), event.isApproved());
    }
}
