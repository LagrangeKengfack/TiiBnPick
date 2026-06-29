package com.polytechnique.tiibntick.domain.exception;

/**
 * Exception thrown when a delivery person is not found.
 *
 * @author Kengfack Lagrange
 * @date 19/12/2025
 */
public class DeliveryPersonNotFoundException extends RuntimeException {
    public DeliveryPersonNotFoundException(String message) {
        super(message);
    }
}
