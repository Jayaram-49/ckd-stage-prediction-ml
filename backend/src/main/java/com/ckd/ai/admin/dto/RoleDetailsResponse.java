package com.ckd.ai.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDetailsResponse {
    private String roleName;
    private String description;
    private List<UserSummary> users;
}
