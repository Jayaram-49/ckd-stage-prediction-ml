package com.ckd.ai.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabResultSummary {
    private Long id;
    private LocalDateTime testDate;
    private Integer stage;
    private Float riskScore;
    private Float serumCreatinine;
    private Float hemoglobin;
}
