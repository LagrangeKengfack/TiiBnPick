package com.polytechnique.tiibntick.domain.model;

import java.time.LocalTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.DayOfWeek;

/**
 * Represents the opening hours for a Point Relais.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@org.springframework.data.relational.core.mapping.Table("opening_hours")
public class OpeningHours {
    @org.springframework.data.annotation.Id
    private UUID id;
    
    @org.springframework.data.relational.core.mapping.Column("logistics_id")
    private UUID logisticsId;
    
    @org.springframework.data.relational.core.mapping.Column("day_of_week")
    private DayOfWeek dayOfWeek;
    
    @org.springframework.data.relational.core.mapping.Column("open_time")
    private LocalTime openTime;
    
    @org.springframework.data.relational.core.mapping.Column("close_time")
    private LocalTime closeTime;
    
    @org.springframework.data.relational.core.mapping.Column("is_closed")
    private Boolean isClosed;
}
