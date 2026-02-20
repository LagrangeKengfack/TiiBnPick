package com.polytechnique.tiibntick.models.enums.subscription;

/**
 * Represents the type of subscription a delivery person can have.
 *
 * @author Kengfack Lagrange
 * @date 21/01/2026
 */
public enum SubscriptionType {

    FREE("FREE"),
    STANDARD("STANDARD"),
    ADVANCE("ADVANCE");

    private final String value;

    SubscriptionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SubscriptionType fromValue(String value) {
        for (SubscriptionType type : SubscriptionType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown subscription type: " + value);
    }
}
