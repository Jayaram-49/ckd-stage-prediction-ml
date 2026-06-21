package com.ckd.ai.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ModelMetricsResponse {
    private float accuracy;
    private float precision;
    private float recall;
    private float f1Score;
    private LocalDateTime lastTrained;
    private String version;
}
