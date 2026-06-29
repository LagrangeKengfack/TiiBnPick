package com.polytechnique.tiibntick.application.service;

import com.polytechnique.tiibntick.domain.port.in.DeliveryPersonLocationUseCase;
import com.polytechnique.tiibntick.application.service.DeliveryPersonLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Application use case implementation for delivery person location updates.
 * Delegates to DeliveryPersonLocationService (existing service layer).
 */
@Service
@RequiredArgsConstructor
public class DeliveryPersonLocationUseCaseImpl implements DeliveryPersonLocationUseCase {

    private final DeliveryPersonLocationService locationService;

    @Override
    public Mono<Void> updateLocation(UUID deliveryPersonId, Float latitude, Float longitude) {
        return locationService.updateLocation(deliveryPersonId,
                latitude != null ? latitude.doubleValue() : null,
                longitude != null ? longitude.doubleValue() : null);
    }
}
