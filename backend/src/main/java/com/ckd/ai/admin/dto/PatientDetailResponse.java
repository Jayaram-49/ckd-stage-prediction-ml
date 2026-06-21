package com.ckd.ai.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDetailResponse {
    private PatientSummary profile;
    private List<LabResultSummary> labResults;
}
