package com.ckd.ai.auth.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String role; // ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN
}
