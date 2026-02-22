package com.polytechnique.tiibntick.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler component for processing automated subscription expirations.
 *
 * @author François-Charles ATANGA
 * @date 22/02/2026
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionScheduler {

    private final SubscriptionPlanService subscriptionPlanService;

    /**
     * Periodically checks for expired subscriptions and updates their status.
     * Scheduled to run every hour.
     */
    @Scheduled(cron = "0 0 * * * *") // Runs at the start of every hour
    public void scheduleSubscriptionExpirations() {
        log.info("Triggering scheduled subscription expiration task.");
        subscriptionPlanService.processAutomatedExpirations()
                .subscribe(); // Non-blocking reactive execution
    }
}
