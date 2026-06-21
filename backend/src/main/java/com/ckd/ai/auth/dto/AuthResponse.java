package com.ckd.ai.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String email;
    private Long userId;
    private String fullName;
    private Set<String> roles;

    public AuthResponse(String accessToken, String username, String email, Set<String> roles) {
        this.accessToken = accessToken;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }

    public AuthResponse(String accessToken, String username, String email, Long userId, String fullName, Set<String> roles) {
        this.accessToken = accessToken;
        this.username = username;
        this.email = email;
        this.userId = userId;
        this.fullName = fullName;
        this.roles = roles;
    }
}
