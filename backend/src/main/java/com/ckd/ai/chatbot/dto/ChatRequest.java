package com.ckd.ai.chatbot.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private String mode; // PATIENT, DOCTOR
    private Long recipientId; // For cross-portal messaging (optional)
}
