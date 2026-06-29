package com.polytechnique.tiibntick.infrastructure.kafka.event;

import com.polytechnique.tiibntick.infrastructure.web.dto.announcement.AnnouncementResponseDTO;
import com.polytechnique.tiibntick.infrastructure.web.dto.client.ClientResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when an announcement is officially published.
 *
 * @author François-Charles ATANGA
 * @date 03/02/2026
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementPublishedEvent {
    private AnnouncementResponseDTO announcement;
    private ClientResponseDTO client;
}
