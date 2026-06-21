package com.ckd.ai.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientSummary {
    private Long patientId;
    private String fullName;
    private String username;
    private String email;
    private int age;
    private String gender;
}
