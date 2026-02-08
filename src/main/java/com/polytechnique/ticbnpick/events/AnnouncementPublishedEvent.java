package com.polytechnique.ticbnpick.events;

import com.polytechnique.ticbnpick.dtos.announcement.AnnouncementResponseDTO;
import com.polytechnique.ticbnpick.dtos.client.ClientResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when an announcement is officially published.
 * Contains detailed information about the announcement and the client for
 * notification services.
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
