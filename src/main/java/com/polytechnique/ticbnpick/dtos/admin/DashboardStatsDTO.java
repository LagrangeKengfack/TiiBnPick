package com.polytechnique.ticbnpick.dtos.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDTO {
    private long pendingCount;
    private long activeCount;
    private long suspendedCount;
    private long rejectedCount;
}
